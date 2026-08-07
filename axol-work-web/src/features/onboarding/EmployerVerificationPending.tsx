import { Clock } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui'

/**
 * Full-screen hold after company setup until Axol Assist sets
 * employerVerificationStatus to verified. Avoids dumping unverified
 * Recruiters into the app where posting silently fails.
 */
export function EmployerVerificationPending() {
  const { user, logOut } = useAuthStore()
  const company = user?.employerProfile?.companyName?.trim()
  const suspended = user?.employerVerificationStatus === 'suspended'

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-page">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-card bg-brand-tint text-brand">
          <Clock className="h-7 w-7" aria-hidden />
        </div>

        {suspended ? (
          <>
            <h1 className="text-title-2 text-fg">Posting is paused</h1>
            <p className="mt-3 text-fg-muted">
              {company ? (
                <>
                  Recruiter access for <span className="font-semibold text-fg">{company}</span> is
                  suspended. Email{' '}
                  <a
                    href="mailto:axolassist.business@gmail.com"
                    className="font-semibold text-brand underline-offset-2 hover:underline"
                  >
                    axolassist.business@gmail.com
                  </a>{' '}
                  if you need help.
                </>
              ) : (
                <>
                  Your Recruiter account can’t post right now. Email{' '}
                  <a
                    href="mailto:axolassist.business@gmail.com"
                    className="font-semibold text-brand underline-offset-2 hover:underline"
                  >
                    axolassist.business@gmail.com
                  </a>{' '}
                  if you need help.
                </>
              )}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-title-2 text-fg">Please wait while we verify your company</h1>
            <p className="mt-3 text-fg-muted">
              {company ? (
                <>
                  Thanks for setting up <span className="font-semibold text-fg">{company}</span>.
                  Axol Assist is reviewing your Recruiter account. You’ll get into Axol Work once
                  you’re verified — usually within a day or two.
                </>
              ) : (
                <>
                  Axol Assist is reviewing your Recruiter account. You’ll get into Axol Work once
                  you’re verified — usually within a day or two.
                </>
              )}
            </p>
          </>
        )}

        <div className="mt-8">
          <Button variant="ghost" onClick={() => logOut()}>
            Log out
          </Button>
        </div>
      </div>
    </main>
  )
}
