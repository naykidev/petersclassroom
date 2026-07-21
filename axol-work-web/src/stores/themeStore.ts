import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggle: () => void
  setTheme: (t: Theme) => void
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  try {
    localStorage.setItem('axol-theme', theme)
  } catch {
    /* ignore */
  }
}

function initial(): Theme {
  try {
    const stored = localStorage.getItem('axol-theme')
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* ignore */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initial(),
  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    apply(next)
    set({ theme: next })
  },
  setTheme: (t) => {
    apply(t)
    set({ theme: t })
  },
}))
