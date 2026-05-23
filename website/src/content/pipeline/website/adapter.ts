import type { PublicLink } from '../../links';
import type { RouteId, WebsiteRoute } from '../../routes';
import type { WebsitePageSection } from '../../pages';
import type {
  CommonloomImageReference,
  CommonloomLinkReference,
  CommonloomSourceTrace,
} from 'commonloom';

export interface WebsiteGeneratedPage {
  routeId: RouteId;
  summary: string;
  bodyHtml: string;
  sections: WebsitePageSection[];
  links: PublicLink[];
  sourceTrace: CommonloomSourceTrace;
}

export interface WebsiteGeneratedMediaRecord extends CommonloomImageReference {
  pageRouteId: RouteId;
}

export interface WebsiteGeneratedNavigationGroup {
  id: string;
  label: string;
  routeIds: RouteId[];
}

export interface WebsiteCompiledContent {
  pages: WebsiteGeneratedPage[];
  routes: WebsiteRoute[];
  navigation: WebsiteGeneratedNavigationGroup[];
  media: WebsiteGeneratedMediaRecord[];
}

export interface WebsiteGeneratedSourceTrace {
  links: CommonloomLinkReference[];
  images: CommonloomImageReference[];
}
