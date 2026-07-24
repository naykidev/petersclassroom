import { usePreviewStore } from '@/stores/previewStore'
import { Button, Modal } from '@/components/ui'
import { PRIVACY_POLICY_URL } from '@/constants/legal'

/** Modal shown when a guest tries a write action in preview mode. */
export function SignupPromptModal() {
  const { signupOpen, signupReason, closeSignup, exit } = usePreviewStore()

  function goAuth() {
    closeSignup()
    exit()
    // Hard navigate so App re-resolves to AuthPage without guest session.
    window.location.assign(`${import.meta.env.BASE_URL}`)
  }

  return (
    <Modal
      open={signupOpen}
      onClose={closeSignup}
      title="Create a free account"
      footer={
        <>
          <Button variant="ghost" onClick={closeSignup}>
            Keep browsing
          </Button>
          <Button onClick={goAuth}>Sign up / Log in</Button>
        </>
      }
    >
      <p className="text-sm text-fg">{signupReason}</p>
      <p className="mt-2 text-sm text-fg-muted">
        Preview lets you look around. Applying, posting, messaging, and scouting need an account.
      </p>
      <p className="mt-3 text-sm text-fg-muted">
        <a
          href={PRIVACY_POLICY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand underline-offset-2 hover:underline"
        >
          Privacy Policy
        </a>
      </p>
    </Modal>
  )
}
