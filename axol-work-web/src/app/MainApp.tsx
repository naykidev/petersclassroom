import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useSocialStore } from '@/stores/socialStore'
import {
  demoConnectionsFor,
  demoConversationsFor,
  demoNotificationsFor,
} from '@/data/demoFixtures'
import { AppShell } from './AppShell'
import { MessagesPage } from '@/features/messaging/MessagesPage'
import { NotificationsPage } from '@/features/notifications/NotificationsPage'
import { SeekerHome } from '@/features/shifts/SeekerHome'
import { ApplicationsPage } from '@/features/applications/ApplicationsPage'
import { NetworkPage } from '@/features/connections/NetworkPage'
import { CommunityPage } from '@/features/feed/CommunityPage'
import { ProfilePage } from '@/features/profile/ProfilePage'
import { PublicProfilePage } from '@/features/profile/PublicProfilePage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { EmployerShiftsPage } from '@/features/shifts/EmployerShiftsPage'
import { ApplicantsHubPage } from '@/features/applications/ApplicantsHubPage'
import { CompanyPage } from '@/features/company/CompanyPage'
import { GroupsPage } from '@/features/groups/GroupsPage'
import { GroupDetailPage } from '@/features/groups/GroupDetailPage'
import { MentorshipPage } from '@/features/mentorship/MentorshipPage'
import { SettingsPage } from '@/features/settings/SettingsPage'

export function MainApp() {
  const { user, isGuest } = useAuthStore()
  const { subscribe, unsubscribe, seedGuest } = useSocialStore()

  useEffect(() => {
    if (!user) return
    if (isGuest) {
      const role = user.role === 'employer' ? 'employer' : 'seeker'
      seedGuest({
        notifications: demoNotificationsFor(role),
        conversations: demoConversationsFor(role),
        connections: demoConnectionsFor(role),
      })
      return () => unsubscribe()
    }
    subscribe(user.uid)
    return () => unsubscribe()
  }, [user, isGuest, subscribe, unsubscribe, seedGuest])

  if (!user) return null
  const isEmployer = user.role === 'employer'

  return (
    <Routes>
      <Route element={<AppShell />}>
        {isEmployer ? (
          <>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/shifts" element={<EmployerShiftsPage />} />
            <Route path="/applicants" element={<ApplicantsHubPage />} />
            <Route path="/company" element={<CompanyPage />} />
          </>
        ) : (
          <>
            <Route path="/" element={<SeekerHome />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </>
        )}

        {/* Shared */}
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/messages/:conversationId" element={<MessagesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:groupId" element={<GroupDetailPage />} />
        <Route path="/mentorship" element={<MentorshipPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/u/:uid" element={<PublicProfilePage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
