import {
  Home,
  Users,
  ClipboardList,
  MessageSquareText,
  LayoutDashboard,
  PlusSquare,
  Inbox,
  Building2,
  Mail,
  Bell,
  UsersRound,
  User,
  Settings,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '@/models'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** show an unread badge keyed by this source */
  badge?: 'notifications' | 'messages'
}

/** Role-specific primary nav (replaces the iOS bottom tab bar). */
const seekerPrimary: NavItem[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/network', label: 'Network', icon: Users },
  { to: '/applications', label: 'Applications', icon: ClipboardList },
  { to: '/community', label: 'Community', icon: MessageSquareText },
  { to: '/profile', label: 'Profile', icon: User },
]

const employerPrimary: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/shifts', label: 'Post Shift', icon: PlusSquare },
  { to: '/applicants', label: 'Applicants', icon: Inbox },
  { to: '/company', label: 'Company', icon: Building2 },
]

/** Shared across roles (messaging, notifications, groups, mentorship, settings). */
const shared: NavItem[] = [
  { to: '/messages', label: 'Messages', icon: Mail, badge: 'messages' },
  { to: '/notifications', label: 'Notifications', icon: Bell, badge: 'notifications' },
  { to: '/groups', label: 'Groups', icon: UsersRound },
  { to: '/mentorship', label: 'Mentorship', icon: Sparkles },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function primaryNav(role: UserRole): NavItem[] {
  return role === 'employer' ? employerPrimary : seekerPrimary
}
export const sharedNav = shared
