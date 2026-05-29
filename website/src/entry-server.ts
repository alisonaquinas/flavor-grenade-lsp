import { render } from 'svelte/server';

import App from './App.svelte';
import { setInitialRoutePath } from './route-runtime';

interface SvelteServerRenderResult {
  body?: string;
  head: string;
  html?: string;
}

export interface RenderedRoute {
  head: string;
  html: string;
}

/** Renders one public route for static prerender output. */
export function renderRoute(initialPath: string): RenderedRoute {
  setInitialRoutePath(initialPath);

  const result = render(App, {
    props: {},
  }) as SvelteServerRenderResult;

  return {
    head: result.head,
    html: result.body ?? result.html ?? '',
  };
}
