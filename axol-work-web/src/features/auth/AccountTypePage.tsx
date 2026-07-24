import { useState } from 'react'
import { Briefcase, Search } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui'
import { PRIVACY_POLICY_URL } from '@/constants/legal'
import type { UserRole } from '@/models'

const CHOICES: {
  role: Exclude<UserRole, 'unassigned'>
  title: string
  label: string
  desc: string
  icon: typeof Search
}[] = [
  {
    role: 'seeker',
    title: 'Prospect',
    label: 'Find work',
    desc: 'Browse shifts matched to your accommodation needs, Express interest in Recruiters, and build your network.',
    icon: Search,
  },
  {
    role: 'employer',
    title: 'Recruiter',
    label: 'Hire people',
    desc: 'Post shifts, Scout Prospects, review applicants, and build an inclusive, accessible workplace.',
    icon: Briefcase,
  },
]

export function AccountTypePage() {
  const { setRole, logOut } = useAuthStore()
  const [pending, setPending] = useState<UserRole | null>(null)

  async function choose(role: Exclude<UserRole, 'unassigned'>) {
    setPending(role)
    try {
      await setRole(role)
    } finally {
      setPending(null)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-page">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-title-2 text-fg">How will you use Axol Work?</h1>
          <p className="mt-2 text-fg-muted">You can’t change this later, so pick what fits.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {CHOICES.map((c) => (
            <button
              key={c.role}
              onClick={() => choose(c.role)}
              disabled={pending !== null}
              className="group flex flex-col items-start gap-3 rounded-card border border-border bg-card p-6 text-left shadow-card transition hover:border-brand hover:shadow-elevated disabled:opacity-60"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-card bg-brand-tint text-brand">
                <c.icon className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <p className="text-headline text-fg">{c.title}</p>
                <p className="mt-0.5 text-sm font-medium text-brand">{c.label}</p>
                <p className="mt-1 text-sm text-fg-muted">{c.desc}</p>
              </div>
              <span className="mt-2 text-sm font-semibold text-brand">
                {pending === c.role ? 'Setting up…' : 'Continue →'}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 text-center">
          <Button variant="ghost" size="sm" onClick={() => logOut()}>
            Log out
          </Button>
          <a
            href={PRIVACY_POLICY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-brand underline-offset-2 hover:underline"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </main>
  )
}
