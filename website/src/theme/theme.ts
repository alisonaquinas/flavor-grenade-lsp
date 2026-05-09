/** Theme modes exposed by the website theme control. */
export const themeModes = ['system', 'light', 'dark'] as const;

/** User-selectable theme mode. */
export type ThemeMode = (typeof themeModes)[number];

/** Concrete theme applied to the document. */
export type ResolvedTheme = 'light' | 'dark';

/** Local storage key for the website theme mode. */
export const themeStorageKey = 'flavor-grenade.theme-mode';

/** Returns true when a value is one of the supported theme modes. */
export function isThemeMode(value: string | null): value is ThemeMode {
  return themeModes.includes(value as ThemeMode);
}

/** Resolves system mode to a concrete light or dark theme. */
export function resolveTheme(mode: ThemeMode, prefersDark: boolean): ResolvedTheme {
  if (mode === 'system') {
    return prefersDark ? 'dark' : 'light';
  }

  return mode;
}

/** Returns the next compact theme-control state. */
export function nextThemeMode(mode: ThemeMode): ThemeMode {
  const currentIndex = themeModes.indexOf(mode);

  return themeModes[(currentIndex + 1) % themeModes.length];
}

/** Reads a persisted theme mode, defaulting to system for first-time visitors. */
export function readStoredTheme(storage: Pick<Storage, 'getItem'>): ThemeMode {
  const stored = storage.getItem(themeStorageKey);

  return isThemeMode(stored) ? stored : 'system';
}

/** Writes a theme mode, clearing the manual override when returning to system. */
export function writeStoredTheme(
  storage: Pick<Storage, 'removeItem' | 'setItem'>,
  mode: ThemeMode,
): void {
  if (mode === 'system') {
    storage.removeItem(themeStorageKey);
    return;
  }

  storage.setItem(themeStorageKey, mode);
}
