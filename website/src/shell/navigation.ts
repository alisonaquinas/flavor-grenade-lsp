import { getRouteById } from '../content/routes';

/** Primary navigation item used by the site shell. */
export interface NavigationItem {
  label: string;
  href: string;
  external?: boolean;
  hideInMobileMenu?: boolean;
}

/** Required primary navigation for the public website shell. */
export const primaryNavigation: readonly NavigationItem[] = [
  { label: 'Home', href: getRouteById('home').path },
  { label: 'Quickstart', href: getRouteById('quickstart').path },
  { label: 'How-To', href: getRouteById('howTo').path },
  { label: 'Concepts', href: getRouteById('concepts').path },
  { label: 'Advanced Usage', href: getRouteById('advancedUsage').path },
  { label: 'FAQ', href: getRouteById('faq').path },
  {
    label: 'GitHub',
    href: 'https://github.com/alisonaquinas/flavor-grenade-lsp',
    external: true,
    hideInMobileMenu: true,
  },
];
