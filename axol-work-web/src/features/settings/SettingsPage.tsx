import { useEffect, useState } from 'react'
import { LogOut, Moon, Sun, Trash2, AlertTriangle, ShieldOff } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { usePreviewStore } from '@/stores/previewStore'
import { getUsers, unblockUser } from '@/features/users/api'
import type { AppUser } from '@/models'
import { Avatar, Button, Card, Input, Modal, SectionHeader } from '@/components/ui'
import { PageHeader } from '@/components/PageHeader'
import { AccessibilityControls } from '@/components/AccessibilityControls'
import { cn } from '@/utils/cn'

export function SettingsPage() {
  const { user, logOut, isGuest } = useAuthStore()
  const me = user!
  const { theme, setTheme } = useThemeStore()
  const [deleteOpen, setDeleteOpen] = useState(false)

  function exitOrSignOut() {
    if (isGuest) {
      usePreviewStore.getState().exit()
      window.location.assign(import.meta.env.BASE_URL)
      return
    }
    logOut()
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Settings" />

      <SectionHeader title="Appearance" />
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-fg">Theme</span>
          <div className="flex gap-1 rounded-btn bg-muted p-1" role="group" aria-label="Theme">
            {(['light', 'dark'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                aria-pressed={theme === t}
                className={cn(
                  'flex min-h-touch items-center gap-1.5 rounded-chip px-3 text-sm font-medium',
                  theme === t ? 'bg-card text-fg shadow-card' : 'text-fg-muted',
                )}
              >
                {t === 'light' ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
                {t === 'light' ? 'Light' : 'Dark'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <SectionHeader title="Accessibility" id="accessibility" />
      <Card className="mb-6">
        <p className="mb-4 text-sm text-fg-muted">
          Adjust text and motion to make Axol Work easier to read. Preferences stay on this device.
        </p>
        <AccessibilityControls />
      </Card>

      <SectionHeader title="Blocked users" />
      <BlockedUsers me={me} />

      <SectionHeader title="Account" />
      <Card className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={me.displayName} />
          <div>
            <p className="font-semibold text-fg">{me.displayName}</p>
            <p className="text-sm text-fg-muted">{isGuest ? 'Preview guest' : me.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          <Button variant="secondary" onClick={exitOrSignOut}>
            <LogOut className="h-4 w-4" aria-hidden /> {isGuest ? 'Exit preview' : 'Sign out'}
          </Button>
          {!isGuest && (
            <Button variant="ghost" className="text-danger" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" aria-hidden /> Delete account
            </Button>
          )}
        </div>
      </Card>

      {deleteOpen && <DeleteAccountModal onClose={() => setDeleteOpen(false)} />}
    </div>
  )
}

function BlockedUsers({ me }: { me: AppUser }) {
  const { updateUser } = useAuthStore()
  const [users, setUsers] = useState<AppUser[] | null>(null)
  const blockedUIDs = me.blockedUIDs ?? []

  useEffect(() => {
    if (!blockedUIDs.length) {
      setUsers([])
      return
    }
    getUsers(blockedUIDs).then(setUsers)
  }, [blockedUIDs.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  async function unblock(uid: string) {
    if (usePreviewStore.getState().requireAccount('Create a free account to manage blocks.')) return
    await unblockUser(me.uid, uid)
    await updateUser({ blockedUIDs: blockedUIDs.filter((b) => b !== uid) })
  }

  return (
    <Card className="mb-6">
      {!users ? (
        <p className="text-sm text-fg-muted">Loading…</p>
      ) : users.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-fg-muted">
          <ShieldOff className="h-4 w-4" aria-hidden /> You haven’t blocked anyone.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {users.map((u) => (
            <li key={u.uid} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar name={u.displayName} size="sm" />
                <span className="text-sm text-fg">{u.displayName}</span>
              </div>
              <Button size="sm" variant="secondary" onClick={() => unblock(u.uid)}>
                Unblock
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

/** Multi-step delete: warning → type DELETE + password → confirm. */
function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const { deleteAccount, error } = useAuthStore()
  const [step, setStep] = useState<1 | 2>(1)
  const [confirmText, setConfirmText] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const canDelete = confirmText === 'DELETE' && password.length > 0

  async function doDelete() {
    if (!canDelete) return
    setBusy(true)
    try {
      await deleteAccount(password)
      // On success onAuthStateChanged clears the session and routes to auth.
    } catch {
      /* error surfaced via store */
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Delete account"
      size="sm"
      footer={
        step === 1 ? (
          <>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="danger" onClick={() => setStep(2)}>Continue</Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="danger" onClick={doDelete} loading={busy} disabled={!canDelete}>
              Permanently delete
            </Button>
          </>
        )
      }
    >
      {step === 1 ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-danger">
            <AlertTriangle className="h-5 w-5" aria-hidden />
            <p className="font-semibold">This can’t be undone</p>
          </div>
          <p className="text-sm text-fg-muted">
            Deleting your account removes your profile and sign-in. Your posts and messages may
            remain visible to others.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {error && (
            <p role="alert" className="rounded-btn bg-danger/15 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
          <Input
            label="Type DELETE to confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
          />
          <Input
            label="Your password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
      )}
    </Modal>
  )
}
