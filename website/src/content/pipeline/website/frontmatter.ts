import { z } from 'zod';

import type { PublicLink } from '../../links';
import type { RouteId } from '../../routes';

export const websitePageFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  h1: z.string().optional(),
  summary: z.string().optional(),
  related: z.array(z.string()).optional(),
  links: z
    .array(
      z.union([
        z.object({
          kind: z.literal('route'),
          routeId: z.string(),
          text: z.string(),
        }),
        z.object({
          kind: z.literal('outbound'),
          href: z.string(),
          text: z.string(),
        }),
      ]),
    )
    .optional(),
});

export type WebsitePageFrontmatter = z.infer<typeof websitePageFrontmatterSchema>;

export function relatedRouteIds(frontmatter: WebsitePageFrontmatter): RouteId[] {
  return (frontmatter.related ?? []) as RouteId[];
}

export function frontmatterLinks(frontmatter: WebsitePageFrontmatter): PublicLink[] {
  return (frontmatter.links ?? []) as PublicLink[];
}
