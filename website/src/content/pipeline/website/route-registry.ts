import { getRouteById, routeIds, type RouteId, type WebsiteRoute } from '../../routes';

export function isWebsiteRouteId(value: string): value is RouteId {
  return (routeIds as readonly string[]).includes(value);
}

export function resolveWebsiteRoute(routeId: RouteId): WebsiteRoute {
  return getRouteById(routeId);
}
