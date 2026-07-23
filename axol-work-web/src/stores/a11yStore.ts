import { create } from 'zustand'

export type A11yFont = 'system' | 'atkinson' | 'lexend' | 'opendyslexic'
export type A11ySpacing = 'normal' | 'wide' | 'wider'
export type A11yLineHeight = 'normal' | 'relaxed' | 'loose'

export interface A11yPrefs {
  font: A11yFont
  /** Root font size percent, e.g. 100, 112, 125. */
  textScale: number
  letterSpacing: A11ySpacing
  lineHeight: A11yLineHeight
  highContrast: boolean
  /** Force-reduce motion even if OS does not. */
  reduceMotion: boolean
  underlineLinks: boolean
}

const STORAGE_KEY = 'axol-a11y'
const DEFAULTS: A11yPrefs = {
  font: 'system',
  textScale: 100,
  letterSpacing: 'normal',
  lineHeight: 'normal',
  highContrast: false,
  reduceMotion: false,
  underlineLinks: false,
}

const FONT_STACK: Record<A11yFont, string> = {
  system: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`,
  atkinson: `'Atkinson Hyperlegible', -apple-system, BlinkMacSystemFont, sans-serif`,
  lexend: `'Lexend', -apple-system, BlinkMacSystemFont, sans-serif`,
  opendyslexic: `'OpenDyslexic', Comic Sans MS, Arial, sans-serif`,
}

const LETTER: Record<A11ySpacing, string> = {
  normal: '0',
  wide: '0.04em',
  wider: '0.08em',
}

const LINE: Record<A11yLineHeight, string> = {
  normal: '1.5',
  relaxed: '1.75',
  loose: '2',
}

function toPrefs(s: A11yPrefs): A11yPrefs {
  return {
    font: s.font,
    textScale: s.textScale,
    letterSpacing: s.letterSpacing,
    lineHeight: s.lineHeight,
    highContrast: s.highContrast,
    reduceMotion: s.reduceMotion,
    underlineLinks: s.underlineLinks,
  }
}

export function applyA11y(prefs: A11yPrefs) {
  const root = document.documentElement
  root.style.fontSize = `${prefs.textScale}%`
  root.style.setProperty('--a11y-font', FONT_STACK[prefs.font])
  root.style.setProperty('--a11y-letter-spacing', LETTER[prefs.letterSpacing])
  root.style.setProperty('--a11y-line-height', LINE[prefs.lineHeight])
  root.dataset.a11yFont = prefs.font
  root.dataset.a11yContrast = prefs.highContrast ? 'high' : 'default'
  root.dataset.a11yMotion = prefs.reduceMotion ? 'reduce' : 'system'
  root.dataset.a11yLinks = prefs.underlineLinks ? 'underline' : 'default'
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toPrefs(prefs)))
  } catch {
    /* ignore */
  }
}

function load(): A11yPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    const parsed = JSON.parse(raw) as Partial<A11yPrefs>
    return { ...DEFAULTS, ...parsed }
  } catch {
    return { ...DEFAULTS }
  }
}

interface A11yState extends A11yPrefs {
  setFont: (font: A11yFont) => void
  setTextScale: (textScale: number) => void
  setLetterSpacing: (letterSpacing: A11ySpacing) => void
  setLineHeight: (lineHeight: A11yLineHeight) => void
  setHighContrast: (highContrast: boolean) => void
  setReduceMotion: (reduceMotion: boolean) => void
  setUnderlineLinks: (underlineLinks: boolean) => void
  reset: () => void
}

const initial = load()
if (typeof document !== 'undefined') applyA11y(initial)

export const useA11yStore = create<A11yState>((set, get) => ({
  ...initial,
  setFont: (font) => {
    applyA11y({ ...toPrefs(get()), font })
    set({ font })
  },
  setTextScale: (textScale) => {
    applyA11y({ ...toPrefs(get()), textScale })
    set({ textScale })
  },
  setLetterSpacing: (letterSpacing) => {
    applyA11y({ ...toPrefs(get()), letterSpacing })
    set({ letterSpacing })
  },
  setLineHeight: (lineHeight) => {
    applyA11y({ ...toPrefs(get()), lineHeight })
    set({ lineHeight })
  },
  setHighContrast: (highContrast) => {
    applyA11y({ ...toPrefs(get()), highContrast })
    set({ highContrast })
  },
  setReduceMotion: (reduceMotion) => {
    applyA11y({ ...toPrefs(get()), reduceMotion })
    set({ reduceMotion })
  },
  setUnderlineLinks: (underlineLinks) => {
    applyA11y({ ...toPrefs(get()), underlineLinks })
    set({ underlineLinks })
  },
  reset: () => {
    applyA11y(DEFAULTS)
    set({ ...DEFAULTS })
  },
}))

export const A11Y_FONT_OPTIONS: { value: A11yFont; label: string; hint: string }[] = [
  { value: 'system', label: 'System', hint: 'Default system font' },
  { value: 'atkinson', label: 'Atkinson', hint: 'Hyperlegible, clear letterforms' },
  { value: 'lexend', label: 'Lexend', hint: 'Designed for reading fluency' },
  { value: 'opendyslexic', label: 'OpenDyslexic', hint: 'Weighted bottoms for dyslexia' },
]

export const A11Y_SCALE_OPTIONS = [100, 112, 125, 150] as const
