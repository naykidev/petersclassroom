import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { resolvePhase } from '@/app/resolveRoute'
import { SplashPage } from '@/features/auth/SplashPage'
import { AuthPage } from '@/features/auth/AuthPage'
import { AccountTypePage } from '@/features/auth/AccountTypePage'
import { SeekerOnboarding } from '@/features/onboarding/SeekerOnboarding'
import { EmployerOnboarding } from '@/features/onboarding/EmployerOnboarding'
import { MainApp } from '@/app/MainApp'
import { makeDemoUser, pathIsDemo, pathIsExplore, usePreviewStore } from '@/stores/previewStore'

const DEMO_BASENAME = '/demo'
const APP_BASENAME = '/work'

/**
 * Top-level app. Real auth lives at `/work/`. Public guest preview lives at `/demo`
 * with a synthetic Prospect/Recruiter user (no Firebase login).
 */
export default function App() {
  const { loading, user, init, isGuest } = useAuthStore()
  const { active, enter, exit, role } = usePreviewStore()

  useEffect(() => {
    init()
  }, [init])

  // Enter preview when landing on /demo (or legacy /work/explore).
  useEffect(() => {
    if (user && !isGuest) {
      if (active) exit()
      return
    }
    if (pathIsExplore(window.location.pathname)) enter()
  }, [user, isGuest, active, enter, exit])

  const onDemoPath =
    typeof window !== 'undefined' && pathIsExplore(window.location.pathname)
  const wantsPreview = (active || onDemoPath) && !(user && !isGuest)

  // Guest preview: mount the real app shell under /demo.
  if (wantsPreview) {
    // Legacy /work/explore bookmarks → /demo
    if (typeof window !== 'undefined' && !pathIsDemo(window.location.pathname)) {
      window.location.replace(`${DEMO_BASENAME}/`)
      return <SplashPage />
    }
    return (
      <BrowserRouter basename={DEMO_BASENAME}>
        <GuestSession role={role} />
      </BrowserRouter>
    )
  }

  const phase = resolvePhase(loading, user)

  switch (phase) {
    case 'splash':
      return <SplashPage />
    case 'auth':
      return <AuthPage />
    case 'accountType':
      return <AccountTypePage />
    case 'seekerOnboarding':
      return <SeekerOnboarding />
    case 'employerOnboarding':
      return <EmployerOnboarding />
    case 'main':
      return (
        <BrowserRouter basename={APP_BASENAME}>
          <MainApp />
        </BrowserRouter>
      )
  }
}

/**
 * Injects a demo user into the auth store for the lifetime of the preview, then
 * mounts MainApp. Real Firebase auth still wins if the user logs in.
 */
function GuestSession({ role }: { role: 'seeker' | 'employer' }) {
  const { user, setGuestSession, clearGuestSession } = useAuthStore()
  const { enter } = usePreviewStore()

  useEffect(() => {
    enter(role)
    setGuestSession(makeDemoUser(role))
  }, [role, setGuestSession, enter])

  useEffect(() => {
    return () => clearGuestSession()
  }, [clearGuestSession])

  if (!user) return <SplashPage />
  return <MainApp />
}
