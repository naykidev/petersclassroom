import { useEffect } from 'react'
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { resolvePhase } from '@/app/resolveRoute'
import { SplashPage } from '@/features/auth/SplashPage'
import { AuthPage } from '@/features/auth/AuthPage'
import { AccountTypePage } from '@/features/auth/AccountTypePage'
import { SeekerOnboarding } from '@/features/onboarding/SeekerOnboarding'
import { EmployerOnboarding } from '@/features/onboarding/EmployerOnboarding'
import { MainApp } from '@/app/MainApp'
import { makeDemoUser, pathIsExplore, usePreviewStore } from '@/stores/previewStore'

/**
 * Top-level app. Real auth takes priority. `/work/explore` opens a full-app
 * guest preview with a synthetic Prospect/Recruiter user (no Firebase login).
 */
export default function App() {
  const { loading, user, init, isGuest } = useAuthStore()
  const { active, enter, exit, role } = usePreviewStore()

  useEffect(() => {
    init()
  }, [init])

  // Enter preview when landing on /work/explore.
  useEffect(() => {
    if (user && !isGuest) {
      if (active) exit()
      return
    }
    if (pathIsExplore(window.location.pathname)) enter()
  }, [user, isGuest, active, enter, exit])

  const wantsPreview =
    (active || pathIsExplore(typeof window !== 'undefined' ? window.location.pathname : '')) &&
    !(user && !isGuest)

  // Guest preview: mount the real app shell with a demo user.
  if (wantsPreview) {
    return (
      <BrowserRouter basename="/work">
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
        <BrowserRouter basename="/work">
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
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    enter(role)
    setGuestSession(makeDemoUser(role))
  }, [role, setGuestSession, enter])

  useEffect(() => {
    return () => clearGuestSession()
  }, [clearGuestSession])

  // Normalize /explore entry to the in-app home once the guest session is ready.
  useEffect(() => {
    if (user && (location.pathname === '/explore' || location.pathname === '/explore/')) {
      navigate('/', { replace: true })
    }
  }, [user, location.pathname, navigate])

  if (!user) return <SplashPage />
  return <MainApp />
}
