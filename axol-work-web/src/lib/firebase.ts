import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

/**
 * Firebase initialization for Axol Work (Web).
 *
 * Reuses the existing `axol-work` Firebase project. Config is read from Vite
 * env vars (see `.env.example`). The Web app config is obtained from the
 * Firebase console (Project settings -> Add web app); it is NOT the iOS key.
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
} as const

// Fail fast in dev if the config is missing, with a pointer to the fix.
if (import.meta.env.DEV) {
  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => k)
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.warn(
      `[firebase] Missing config: ${missing.join(
        ', ',
      )}. Copy .env.example to .env.local and fill in the Web app config from the Firebase console.`,
    )
  }
}

export const app: FirebaseApp = initializeApp(firebaseConfig)
export const auth: Auth = getAuth(app)
export const db: Firestore = getFirestore(app)
