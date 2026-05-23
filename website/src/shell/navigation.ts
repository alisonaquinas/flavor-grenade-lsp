import * as routeModule from '../content/routes';
import type { RouteId, WebsiteRoute } from '../content/routes';

type NavigationArticleGroup = 'howTo' | 'concepts' | 'advancedUsage';

type RouteNavigationMetadata = WebsiteRoute & {
  articleGroup?: NavigationArticleGroup;
  articleGroups?: Partial<Record<NavigationArticleGroup, readonly RouteId[]>>;
  navigationParent?: RouteId;
  navParent?: RouteId;
  parentRouteId?: RouteId;
};

interface GuideArticleGroup {
  hubRouteId: NavigationArticleGroup;
  routeIds: readonly RouteId[];
}

/** Article link exposed inside a primary navigation dropdown. */
export interface NavigationArticleLink {
  label: string;
  href: string;
  description: string;
  routeId: RouteId;
}

/** Primary navigation item used by the site shell. */
export interface NavigationItem {
  label: string;
  href: string;
  menuId?: string;
  external?: boolean;
  children?: readonly NavigationArticleLink[];
}

const { getRouteById, websiteRoutes } = routeModule;
const guideArticleGroups =
  (routeModule as typeof routeModule & { guideArticleGroups?: readonly GuideArticleGroup[] })
    .guideArticleGroups ?? [];

const articleFallbacks: Record<NavigationArticleGroup, (route: WebsiteRoute) => boolean> = {
  howTo: (routeRecord) => routeRecord.pageType === 'how-to',
  concepts: (routeRecord) => routeRecord.pageType === 'concept',
  advancedUsage: (routeRecord) =>
    routeRecord.id !== 'advancedUsage' &&
    (routeRecord.path.startsWith('/advanced-usage/') ||
      ['advanced', 'advanced-usage', 'advanced-topic'].includes(routeRecord.pageType)),
};

function routeToArticleLink(routeRecord: WebsiteRoute): NavigationArticleLink {
  return {
    label: routeRecord.h1,
    href: routeRecord.path,
    description: routeRecord.description,
    routeId: routeRecord.id,
  };
}

function routeHasNavigationParent(
  routeRecord: WebsiteRoute,
  group: NavigationArticleGroup,
): boolean {
  const routeMetadata = routeRecord as RouteNavigationMetadata;

  return (
    routeMetadata.articleGroup === group ||
    routeMetadata.navigationParent === group ||
    routeMetadata.navParent === group ||
    routeMetadata.parentRouteId === group
  );
}

function getExplicitArticleRoutes(group: NavigationArticleGroup): WebsiteRoute[] {
  const hubRoute = getRouteById(group) as RouteNavigationMetadata;
  const routeIds =
    guideArticleGroups.find((articleGroup) => articleGroup.hubRouteId === group)?.routeIds ??
    hubRoute.articleGroups?.[group];

  if (!routeIds?.length) {
    return [];
  }

  return routeIds.map((routeId) => getRouteById(routeId));
}

function getArticleLinks(group: NavigationArticleGroup): readonly NavigationArticleLink[] {
  const explicitRoutes = getExplicitArticleRoutes(group);
  const groupedRoutes = websiteRoutes.filter((routeRecord) =>
    routeHasNavigationParent(routeRecord, group),
  );
  const fallbackRoutes = websiteRoutes.filter(articleFallbacks[group]);
  const articleRoutes =
    explicitRoutes.length > 0
      ? explicitRoutes
      : groupedRoutes.length > 0
        ? groupedRoutes
        : fallbackRoutes;

  if (group === 'advancedUsage' && articleRoutes.length === 0) {
    return [routeToArticleLink(getRouteById('advancedUsage'))];
  }

  return articleRoutes.map(routeToArticleLink);
}

/** Required primary navigation for the public website shell. */
export const primaryNavigation: readonly NavigationItem[] = [
  { label: 'Home', href: getRouteById('home').path },
  { label: 'Quickstart', href: getRouteById('quickstart').path },
  {
    label: 'How-To',
    href: getRouteById('howTo').path,
    menuId: 'how-to-navigation-menu',
    children: getArticleLinks('howTo'),
  },
  {
    label: 'Concepts',
    href: getRouteById('concepts').path,
    menuId: 'concepts-navigation-menu',
    children: getArticleLinks('concepts'),
  },
  {
    label: 'Advanced Usage',
    href: getRouteById('advancedUsage').path,
    menuId: 'advanced-usage-navigation-menu',
    children: getArticleLinks('advancedUsage'),
  },
  { label: 'FAQ', href: getRouteById('faq').path },
];
