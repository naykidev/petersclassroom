import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Moon, Sun } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { Button, Input, PasswordInput } from '@/components/ui'
import { cn } from '@/utils/cn'

type Mode = 'login' | 'signup' | 'reset'

const REMEMBER_KEY = 'axol-remember-me'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(1, 'Enter your password.'),
  rememberMe: z.boolean().optional(),
})
const signupSchema = z.object({
  displayName: z.string().min(2, 'Enter your name.'),
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(6, 'At least 6 characters.'),
})
const resetSchema = z.object({ email: z.string().email('Enter a valid email.') })

type Values = z.infer<typeof signupSchema> & z.infer<typeof loginSchema>

function readRememberPreference(): boolean {
  try {
    const stored = localStorage.getItem(REMEMBER_KEY)
    if (stored === null) return true
    return stored === '1'
  } catch {
    return true
  }
}

function writeRememberPreference(value: boolean) {
  try {
    localStorage.setItem(REMEMBER_KEY, value ? '1' : '0')
  } catch {
    /* ignore */
  }
}

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [resetSent, setResetSent] = useState(false)
  const [oauthBusy, setOauthBusy] = useState<'google' | 'linkedin' | null>(null)
  const { signUp, logIn, logInWithGoogle, logInWithLinkedIn, resetPassword, error, clearError } =
    useAuthStore()
  const { theme, toggle, setTheme } = useThemeStore()
  const formErrorId = useId()
  const rememberId = useId()

  // Honor system preference when the user has not chosen a theme yet.
  useEffect(() => {
    try {
      if (localStorage.getItem('axol-theme')) return
    } catch {
      /* ignore */
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const sync = () => setTheme(mq.matches ? 'dark' : 'light')
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [setTheme])

  const schema =
    mode === 'login' ? loginSchema : mode === 'signup' ? signupSchema : resetSchema

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Values>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues: {
      rememberMe: readRememberPreference(),
    },
  })

  function switchMode(next: Mode) {
    clearError()
    setResetSent(false)
    setOauthBusy(null)
    reset({
      displayName: '',
      email: '',
      password: '',
      rememberMe: readRememberPreference(),
    })
    setMode(next)
  }

  const onSubmit = handleSubmit(async (v) => {
    try {
      if (mode === 'login') {
        const remember = v.rememberMe ?? true
        writeRememberPreference(remember)
        await logIn(v.email, v.password, remember)
      } else if (mode === 'signup') {
        await signUp(v.email, v.password, v.displayName)
      } else {
        await resetPassword(v.email)
        setResetSent(true)
      }
    } catch {
      /* error surfaced via store */
    }
  })

  async function continueWithGoogle() {
    clearError()
    setOauthBusy('google')
    try {
      await logInWithGoogle()
    } catch {
      /* error surfaced via store */
    } finally {
      setOauthBusy(null)
    }
  }

  async function continueWithLinkedIn() {
    clearError()
    setOauthBusy('linkedin')
    try {
      await logInWithLinkedIn()
    } catch {
      /* error surfaced via store */
    } finally {
      setOauthBusy(null)
    }
  }

  const linkBtn =
    'rounded-btn px-1 py-0.5 font-semibold text-brand underline-offset-2 ' +
    'hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand'

  return (
    <main className="flex min-h-screen items-center justify-center bg-page p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt=""
            width={56}
            height={56}
            className="mx-auto mb-3 h-14 w-14 rounded-full"
            aria-hidden="true"
          />
          <h1 className="text-title-2 text-fg">Axol Work</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Accessibility-first work and community
          </p>
        </div>

        <div className="relative rounded-card border border-border bg-card p-6 shadow-elevated sm:p-8">
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className={cn(
              'absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-btn',
              'text-fg-muted transition hover:bg-muted hover:text-fg',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
            )}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" aria-hidden />
            ) : (
              <Moon className="h-5 w-5" aria-hidden />
            )}
          </button>

          <h2 className="mb-1 pr-12 text-headline text-fg">
            {mode === 'login'
              ? 'Log in'
              : mode === 'signup'
                ? 'Create your account'
                : 'Reset your password'}
          </h2>
          <p className="mb-5 text-sm text-fg-muted">
            {mode === 'login'
              ? 'Welcome back. Use your email or continue with a provider.'
              : mode === 'signup'
                ? 'Takes a minute. You will pick Prospect or Recruiter next.'
                : 'We will email you a link to choose a new password.'}
          </p>

          {error && (
            <div
              id={formErrorId}
              role="alert"
              className="mb-4 rounded-btn border border-danger/40 bg-danger/15 px-3 py-2 text-sm text-danger"
            >
              {error}
            </div>
          )}
          {resetSent && (
            <div
              role="status"
              className="mb-4 rounded-btn border border-success/40 bg-success/15 px-3 py-2 text-sm text-success"
            >
              Check your inbox for a reset link.
            </div>
          )}

          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-4"
            noValidate
            aria-describedby={error ? formErrorId : undefined}
          >
            {mode === 'signup' && (
              <Input
                label="Full name"
                autoComplete="name"
                error={errors.displayName?.message}
                {...register('displayName')}
              />
            )}
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              inputMode="email"
              error={errors.email?.message}
              {...register('email')}
            />
            {mode !== 'reset' && (
              <PasswordInput
                label="Password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                error={errors.password?.message}
                {...register('password')}
              />
            )}

            {mode === 'login' && (
              <div className="flex items-center gap-3">
                <input
                  id={rememberId}
                  type="checkbox"
                  className={cn(
                    'h-5 w-5 shrink-0 rounded border-border text-brand',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                  )}
                  {...register('rememberMe')}
                />
                <label htmlFor={rememberId} className="text-sm font-medium text-fg">
                  Remember me on this device
                </label>
              </div>
            )}

            <Button type="submit" loading={isSubmitting} fullWidth size="lg">
              {mode === 'login'
                ? 'Log in'
                : mode === 'signup'
                  ? 'Sign up'
                  : 'Send reset link'}
            </Button>
          </form>

          {mode !== 'reset' && (
            <>
              <div className="my-6 flex items-center gap-3" role="separator" aria-label="Or continue with">
                <div className="h-px flex-1 bg-border" />
                <span className="text-caption font-semibold uppercase tracking-wide text-fg-muted">
                  Or continue with
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  loading={oauthBusy === 'google'}
                  disabled={!!oauthBusy || isSubmitting}
                  onClick={continueWithGoogle}
                  aria-label="Continue with Google"
                >
                  <GoogleIcon />
                  Google
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  loading={oauthBusy === 'linkedin'}
                  disabled={!!oauthBusy || isSubmitting}
                  onClick={continueWithLinkedIn}
                  aria-label="Continue with LinkedIn"
                >
                  <LinkedInIcon />
                  LinkedIn
                </Button>
              </div>
            </>
          )}

          <div className="mt-6 flex flex-col gap-2 text-center text-sm">
            {mode === 'login' && (
              <>
                <button type="button" className={linkBtn} onClick={() => switchMode('reset')}>
                  Forgot your password?
                </button>
                <p className="text-fg-muted">
                  New here?{' '}
                  <button type="button" className={linkBtn} onClick={() => switchMode('signup')}>
                    Create an account
                  </button>
                </p>
              </>
            )}
            {mode !== 'login' && (
              <button type="button" className={linkBtn} onClick={() => switchMode('login')}>
                Back to log in
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M6.6 14.3l-.9.7-2.5 1.9C4.9 19.7 8.2 22 12 22c2.7 0 5-.9 6.7-2.4l-3.1-2.4c-.9.6-2 1-3.6 1-2.8 0-5.1-1.9-5.9-4.4z"
      />
      <path
        fill="#4A90E2"
        d="M3.2 7.1C2.4 8.7 2 10.3 2 12s.4 3.3 1.2 4.9l3.4-2.6C6.3 13.3 6 12.7 6 12s.3-1.3.6-1.9L3.2 7.1z"
      />
      <path
        fill="#FBBC05"
        d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.9 14.7 2 12 2 8.2 2 4.9 4.3 3.2 7.1l3.4 2.6C7 8 9.2 6 12 6z"
      />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#0A66C2"
        d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22 0H2C.9 0 0 .9 0 2v20c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2z"
      />
    </svg>
  )
}

