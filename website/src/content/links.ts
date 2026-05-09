import type { WebsiteRoute } from './routes';

/** Route link or approved outbound link exposed in public website content. */
export type PublicLink =
  | {
      kind: 'route';
      routeId: string;
      text: string;
    }
  | {
      kind: 'outbound';
      href: string;
      text: string;
    };

/** Outbound hosts approved for public website content and attribution links. */
export const approvedOutboundHosts = [
  'github.com',
  'gist.github.com',
  'karpathy.ai',
  'marketplace.visualstudio.com',
  'obsidian.md',
] as const;

/** Creates a route link with descriptive public text. */
export function routeLink(routeId: string, text: string): PublicLink {
  return { kind: 'route', routeId, text };
}

/** Creates an outbound link with descriptive public text. */
export function outboundLink(href: string, text: string): PublicLink {
  return { kind: 'outbound', href, text };
}

/** Returns validation messages for public links. */
export function validatePublicLinks(
  links: readonly PublicLink[],
  routes: readonly WebsiteRoute[],
): string[] {
  const messages: string[] = [];
  const routeIds = new Set(routes.map((route) => route.id));
  const allowedHosts = new Set<string>(approvedOutboundHosts);

  for (const link of links) {
    if (!link.text.trim()) {
      messages.push('A public link is missing descriptive text.');
    }

    if (link.kind === 'route') {
      if (!routeIds.has(link.routeId as WebsiteRoute['id'])) {
        messages.push(`${link.text} points to unknown route ${link.routeId}.`);
      }
      continue;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(link.href);
    } catch {
      messages.push(`${link.text} has invalid outbound URL ${link.href}.`);
      continue;
    }

    if (parsedUrl.protocol !== 'https:') {
      messages.push(`${link.text} must use an HTTPS outbound URL.`);
    }

    if (!allowedHosts.has(parsedUrl.hostname)) {
      messages.push(`${link.text} points to unapproved outbound host ${parsedUrl.hostname}.`);
    }
  }

  return messages;
}
