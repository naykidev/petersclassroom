import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/authStore'
import { Button, Input } from '@/components/ui'

type Mode = 'login' | 'signup' | 'reset'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(1, 'Enter your password.'),
})
const signupSchema = z.object({
  displayName: z.string().min(2, 'Enter your name.'),
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(6, 'At least 6 characters.'),
})
const resetSchema = z.object({ email: z.string().email('Enter a valid email.') })

type Values = z.infer<typeof signupSchema> & z.infer<typeof loginSchema>

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [resetSent, setResetSent] = useState(false)
  const { signUp, logIn, resetPassword, error, clearError } = useAuthStore()

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
  })

  function switchMode(next: Mode) {
    clearError()
    setResetSent(false)
    reset()
    setMode(next)
  }

  const onSubmit = handleSubmit(async (v) => {
    try {
      if (mode === 'login') await logIn(v.email, v.password)
      else if (mode === 'signup') await signUp(v.email, v.password, v.displayName)
      else {
        await resetPassword(v.email)
        setResetSent(true)
      }
    } catch {
      /* error surfaced via store */
    }
  })

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-page">
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
            Accessibility-first work &amp; community
          </p>
        </div>

        <div className="rounded-card bg-card border border-border shadow-card p-6">
          <h2 className="text-headline mb-4 text-fg">
            {mode === 'login'
              ? 'Log in'
              : mode === 'signup'
                ? 'Create your account'
                : 'Reset your password'}
          </h2>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-btn bg-danger/15 px-3 py-2 text-sm text-danger"
            >
              {error}
            </div>
          )}
          {resetSent && (
            <div
              role="status"
              className="mb-4 rounded-btn bg-success/15 px-3 py-2 text-sm text-success"
            >
              Check your inbox for a reset link.
            </div>
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
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
              error={errors.email?.message}
              {...register('email')}
            />
            {mode !== 'reset' && (
              <Input
                label="Password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                error={errors.password?.message}
                {...register('password')}
              />
            )}

            <Button type="submit" loading={isSubmitting} fullWidth size="lg">
              {mode === 'login'
                ? 'Log in'
                : mode === 'signup'
                  ? 'Sign up'
                  : 'Send reset link'}
            </Button>
          </form>

          <div className="mt-4 flex flex-col gap-2 text-center text-sm">
            {mode === 'login' && (
              <>
                <button
                  className="text-brand font-semibold hover:underline"
                  onClick={() => switchMode('reset')}
                >
                  Forgot your password?
                </button>
                <p className="text-fg-muted">
                  New here?{' '}
                  <button
                    className="text-brand font-semibold hover:underline"
                    onClick={() => switchMode('signup')}
                  >
                    Create an account
                  </button>
                </p>
              </>
            )}
            {mode !== 'login' && (
              <button
                className="text-brand font-semibold hover:underline"
                onClick={() => switchMode('login')}
              >
                Back to log in
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
