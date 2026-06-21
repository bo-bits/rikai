/**
 * Claude-like palette: warm off-white "paper" backgrounds, near-black ink text,
 * and a terracotta/clay accent. Light + dark variants share the same keys so the
 * `ThemeColor` union (and the themed-* components) stay valid.
 *
 * UI/UX is intentionally minimal for now — this is plumbing. Tune freely.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1F1E1C',
    textSecondary: '#6E6B64',
    background: '#F7F4EE',
    backgroundElement: '#EFEAE1',
    backgroundSelected: '#E6DFD2',
    border: '#E2DBCE',
    tint: '#C96442', // terracotta accent
    danger: '#B3402F',
  },
  dark: {
    text: '#F2EFE9',
    textSecondary: '#A8A39A',
    background: '#1F1E1C',
    backgroundElement: '#2A2926',
    backgroundSelected: '#33312D',
    border: '#3A382F',
    tint: '#D97757',
    danger: '#E0735A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
