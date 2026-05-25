/** Icon names used by the website shell and homepage controls. */
export type IconName =
  | 'book-open'
  | 'external-link'
  | 'github'
  | 'globe'
  | 'linkedin'
  | 'menu'
  | 'monitor'
  | 'moon'
  | 'package'
  | 'store'
  | 'sun'
  | 'terminal';

/** Accessible descriptions for decorative icon choices when needed in tests. */
export const iconLabels: Readonly<Record<IconName, string>> = {
  'book-open': 'Book',
  'external-link': 'External link',
  github: 'GitHub',
  globe: 'Website',
  linkedin: 'LinkedIn',
  menu: 'Menu',
  monitor: 'System theme',
  moon: 'Dark theme',
  package: 'Package',
  store: 'Marketplace',
  sun: 'Light theme',
  terminal: 'Terminal',
};

/** Simple stroke icon paths sized for a 24 by 24 viewBox. */
export const iconPaths: Readonly<Record<IconName, string>> = {
  'book-open': 'M4 19.5V5a2 2 0 0 1 2-2h5v17H6a2 2 0 0 0-2 2Zm9-16h5a2 2 0 0 1 2 2v14.5a2 2 0 0 0-2-2h-5Z',
  'external-link': 'M14 4h6v6m0-6-9 9M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4',
  github: 'M15 22v-4a4 4 0 0 0-1-3c3 0 6-2 6-6a5 5 0 0 0-1-3 5 5 0 0 0 0-3s-1 0-3 1a10 10 0 0 0-6 0C8 3 7 3 7 3a5 5 0 0 0 0 3 5 5 0 0 0-1 3c0 4 3 6 6 6a4 4 0 0 0-1 3v4m-1-4c-4 1-4-2-6-2',
  globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 0c3 3 3 17 0 20m0-20c-3 3-3 17 0 20M2 12h20',
  linkedin: 'M6 9v11M6 4v1m5 15v-6a3 3 0 0 1 6 0v6m-6-11v11',
  menu: 'M4 7h16M4 12h16M4 17h16',
  monitor: 'M4 5h16v11H4Zm5 16h6m-3-5v5',
  moon: 'M20 15.5A8.5 8.5 0 0 1 8.5 4 7 7 0 1 0 20 15.5Z',
  package: 'M21 8 12 3 3 8v8l9 5 9-5ZM3 8l9 5 9-5M12 13v10',
  store: 'M4 10h16l-1-5H5Zm2 0v10h12V10M9 20v-5h6v5',
  sun: 'M12 4V2m0 20v-2m8-8h2M2 12h2m14.5-6.5L20 4M4 20l1.5-1.5m0-13L4 4m16 16-1.5-1.5M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z',
  terminal: 'M4 5h16v14H4Zm3 4 3 3-3 3m5 0h5',
};

/** Returns the path data for a supported icon. */
export function iconPath(icon: IconName): string {
  return iconPaths[icon];
}
