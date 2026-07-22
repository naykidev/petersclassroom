import { create } from 'zustand'
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth'
import { deleteDoc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { auth } from '@/lib/firebase'
import { userDoc } from '@/lib/firestore'
import type { AppUser, UserRole } from '@/models'

/**
 * Auth + session store. Owns the Firebase auth session and a live snapshot of
 * the current user doc.
 */

interface AuthState {
  firebaseUser: FirebaseUser | null
  user: AppUser | null
  /** true until the first auth state + user doc resolve (drives the splash). */
  loading: boolean
  error: string | null

  init: () => void
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  logIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  logInWithGoogle: () => Promise<void>
  logOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  setRole: (role: UserRole) => Promise<void>
  updateUser: (patch: Partial<AppUser>) => Promise<void>
  deleteAccount: (password: string) => Promise<void>
  clearError: () => void
}

// NOTE: `email` is intentionally omitted. The Firestore rules reject any
// write to users/{uid} containing an `email` field (PII stays in Auth).
function defaultUserDoc(uid: string, _email: string, displayName: string): AppUser {
  void _email
  return {
    uid,
    displayName,
    role: 'unassigned',
    headline: '',
    workHistoryTags: [],
    connectionCount: 0,
    isVerifiedEmployed: false,
    verifiedEmployerUIDs: [],
    selectedCity: '',
    accommodationTags: [],
    accommodationNeeds: [],
    blockedUIDs: [],
  }
}

function toMessage(e: unknown): string {
  const code = (e as { code?: string })?.code ?? ''
  const map: Record<string, string> = {
    'auth/invalid-email': 'That email address is not valid.',
    'auth/user-not-found': 'No account found with that email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/email-already-in-use': 'An account with that email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/popup-blocked': 'Pop-up was blocked. Allow pop-ups and try again.',
    'auth/unauthorized-domain':
      'This site is not authorized for Google sign-in yet. Add axolassist.com under Firebase Authentication → Settings → Authorized domains.',
    'auth/account-exists-with-different-credential':
      'An account already exists with this email using a different sign-in method.',
    'auth/operation-not-allowed':
      'That sign-in method is not enabled yet. Use email and password, or contact support.',
  }
  return map[code] ?? (e as Error)?.message ?? 'Something went wrong.'
}

async function ensureUserDoc(fbUser: FirebaseUser): Promise<void> {
  const ref = userDoc(fbUser.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(
      ref,
      defaultUserDoc(fbUser.uid, fbUser.email ?? '', fbUser.displayName ?? 'Member'),
    )
  }
}

async function signInWithGooglePopup(): Promise<void> {
  await setPersistence(auth, browserLocalPersistence)
  const cred = await signInWithPopup(auth, new GoogleAuthProvider())
  await ensureUserDoc(cred.user)
}

// Live unsubscribe for the current user doc snapshot.
let userDocUnsub: (() => void) | null = null

export const useAuthStore = create<AuthState>((set, get) => ({
  firebaseUser: null,
  user: null,
  loading: true,
  error: null,

  init: () => {
    onAuthStateChanged(auth, async (fbUser) => {
      userDocUnsub?.()
      userDocUnsub = null

      if (!fbUser) {
        set({ firebaseUser: null, user: null, loading: false })
        return
      }

      set({ firebaseUser: fbUser })
      const ref = userDoc(fbUser.uid)

      await ensureUserDoc(fbUser)

      // Subscribe to live user-doc updates so role/onboarding stay in sync.
      // Email isn't stored on the doc. Merge it in from the auth session.
      userDocUnsub = onSnapshot(
        ref,
        (docSnap) => {
          const data = docSnap.data()
          set({
            user: data ? { ...data, email: fbUser.email ?? '' } : null,
            loading: false,
          })
        },
        () => set({ loading: false, error: 'Could not load your profile.' }),
      )
    })
  },

  signUp: async (email, password, displayName) => {
    set({ error: null })
    try {
      await setPersistence(auth, browserLocalPersistence)
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName })
      await setDoc(userDoc(cred.user.uid), defaultUserDoc(cred.user.uid, email, displayName))
    } catch (e) {
      set({ error: toMessage(e) })
      throw e
    }
  },

  logIn: async (email, password, rememberMe = true) => {
    set({ error: null })
    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence,
      )
      await signInWithEmailAndPassword(auth, email, password)
    } catch (e) {
      set({ error: toMessage(e) })
      throw e
    }
  },

  logInWithGoogle: async () => {
    set({ error: null })
    try {
      await signInWithGooglePopup()
    } catch (e) {
      set({ error: toMessage(e) })
      throw e
    }
  },

  logOut: async () => {
    await signOut(auth)
  },

  resetPassword: async (email) => {
    set({ error: null })
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (e) {
      set({ error: toMessage(e) })
      throw e
    }
  },

  setRole: async (role) => {
    const uid = get().firebaseUser?.uid
    if (!uid) return
    await updateDoc(userDoc(uid), { role })
  },

  updateUser: async (patch) => {
    const uid = get().firebaseUser?.uid
    if (!uid) return
    const { uid: _uid, ...rest } = patch
    void _uid
    await updateDoc(userDoc(uid), rest)
  },

  deleteAccount: async (password) => {
    const fbUser = get().firebaseUser
    if (!fbUser?.email) return
    set({ error: null })
    try {
      const cred = EmailAuthProvider.credential(fbUser.email, password)
      await reauthenticateWithCredential(fbUser, cred)
      await deleteDoc(userDoc(fbUser.uid))
      await deleteUser(fbUser)
    } catch (e) {
      set({ error: toMessage(e) })
      throw e
    }
  },

  clearError: () => set({ error: null }),
}))
