import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useSocialStore } from '@/stores/socialStore'
import { useThemeStore } from '@/stores/themeStore'
import { primaryNav, sharedNav, type NavItem } from './nav'
import { Avatar } from '@/components/ui'
import { cn } from '@/utils/cn'

export function AppShell() {
  const { user } = useAuthStore()
  const { theme, toggle } = useThemeStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!user) return null
  const primary = primaryNav(user.role)

  const sidebar = (
    <nav aria-label="Main navigation" className="flex h-full flex-col gap-1 p-3">
      <div className="mb-4 flex items-center gap-2 px-2 pt-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-brand text-brand-fg font-bold">
          A
        </div>
        <span className="text-headline text-fg">Axol Work</span>
      </div>

      <div className="flex flex-col gap-1">
        {primary.map((item) => (
          <NavItemLink key={item.to} item={item} onNavigate={() => setMobileOpen(false)} />
        ))}
      </div>

      <div className="my-3 border-t border-border" />

      <div className="flex flex-col gap-1">
        {sharedNav.map((item) => (
          <NavItemLink key={item.to} item={item} onNavigate={() => setMobileOpen(false)} />
        ))}
      </div>

      <div className="mt-auto flex items-center gap-2 rounded-btn p-2">
        <Avatar name={user.displayName} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-fg">{user.displayName}</p>
          <p className="truncate text-caption text-fg-muted capitalize">{user.role}</p>
        </div>
        <button
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex h-9 w-9 items-center justify-center rounded-btn text-fg-muted hover:bg-muted hover:text-fg"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </nav>
  )

  return (
    <div className="min-h-screen bg-page text-fg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-btn focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-fg"
      >
        Skip to content
      </a>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card lg:block">
        {sidebar}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card p-3 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="flex h-11 w-11 items-center justify-center rounded-btn hover:bg-muted"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="text-headline">Axol Work</span>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-card shadow-elevated">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-btn hover:bg-muted"
            >
              <X className="h-6 w-6" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      <main id="main-content" className="lg:pl-64">
        <div className="mx-auto max-w-6xl p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function NavItemLink({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const { user } = useAuthStore()
  const { unreadNotificationCount, unreadConversationCount } = useSocialStore()
  const count =
    item.badge === 'notifications'
      ? unreadNotificationCount()
      : item.badge === 'messages' && user
        ? unreadConversationCount(user.uid)
        : 0

  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex min-h-touch items-center gap-3 rounded-btn px-3 text-sm font-medium transition',
          isActive
            ? 'bg-brand-tint text-brand'
            : 'text-fg-muted hover:bg-muted hover:text-fg',
        )
      }
    >
      <item.icon className="h-5 w-5 shrink-0" aria-hidden />
      <span className="flex-1">{item.label}</span>
      {count > 0 && (
        <span
          className="min-w-[20px] rounded-full bg-brand px-1.5 text-center text-xs font-bold text-brand-fg"
          aria-label={`${count} unread`}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </NavLink>
  )
}
