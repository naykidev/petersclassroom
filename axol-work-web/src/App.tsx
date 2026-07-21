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

export default function App() {
  const { loading, user, init } = useAuthStore()

  useEffect(() => {
    init()
  }, [init])

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
