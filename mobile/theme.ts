export const palette = {
  dark: {
    bg: '#05070f',
    card: '#0b1021',
    border: '#1f2937',
    text: '#f8fafc',
    muted: '#9ca3af',
    accent: '#e50914',
  },
  light: {
    bg: '#f8fafc',
    card: '#ffffff',
    border: '#e5e7eb',
    text: '#0f172a',
    muted: '#475569',
    accent: '#e50914',
  },
} as const

export type Theme = keyof typeof palette
export type ThemeColors = (typeof palette)[Theme]
