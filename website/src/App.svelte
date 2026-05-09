<script lang="ts">
  import { onMount } from 'svelte';

  import { getWebsitePageByPath } from './content/pages';
  import { getRouteById, websiteRoutes } from './content/routes';
  import {
    featureHighlights,
    homepageHero,
    homepageProof,
  } from './home/homepage';
  import {
    footerByline,
    inspirationLinks,
    profileLinks,
    projectLinks,
  } from './shell/footer';
  import { primaryNavigation } from './shell/navigation';
  import {
    readStoredTheme,
    resolveTheme,
    themeModes,
    writeStoredTheme,
    type ThemeMode,
  } from './theme/theme';

  let themeMode: ThemeMode = 'system';
  let resolvedTheme = 'light';
  let activePath = '/';
  $: activePage = getWebsitePageByPath(activePath, websiteRoutes);
  $: activeRoute = getRouteById(activePage.routeId);
  $: isHome = activePage.routeId === 'home';
  const productIcon = new URL(
    '../../docs/assets/flavor-grenade-lsp-icon-light-transparent.png',
    import.meta.url,
  ).href;
  const proofImage = new URL(
    '../../extension/images/marketplace/wiki-link-completion.png',
    import.meta.url,
  ).href;

  function applyTheme(mode: ThemeMode, prefersDark: boolean): void {
    resolvedTheme = resolveTheme(mode, prefersDark);
    document.documentElement.dataset.themeMode = mode;
    document.documentElement.dataset.theme = resolvedTheme;
  }

  function setThemeMode(mode: ThemeMode): void {
    themeMode = mode;
    writeStoredTheme(window.localStorage, mode);
    applyTheme(mode, window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  function routePath(routeId: string): string {
    return getRouteById(routeId as Parameters<typeof getRouteById>[0]).path;
  }

  function routeHeading(routeId: string): string {
    return getRouteById(routeId as Parameters<typeof getRouteById>[0]).h1;
  }

  onMount(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    activePath = window.location.pathname;
    themeMode = readStoredTheme(window.localStorage);
    applyTheme(themeMode, mediaQuery.matches);

    const onPreferenceChange = (event: MediaQueryListEvent): void => {
      applyTheme(themeMode, event.matches);
    };

    mediaQuery.addEventListener('change', onPreferenceChange);

    return () => mediaQuery.removeEventListener('change', onPreferenceChange);
  });
</script>

<svelte:head>
  <meta name="color-scheme" content={resolvedTheme} />
</svelte:head>

<a class="skip-link" href="#main-content">Skip to main content</a>

<header class="site-header">
  <a class="brand-mark" href="/" aria-label="Flavor Grenade LSP home">
    <img class="brand-icon" src={productIcon} alt="" aria-hidden="true" />
    <span>
      <strong>Flavor Grenade LSP</strong>
      <small>Obsidian Flavored Markdown tools</small>
    </span>
  </a>

  <nav class="primary-nav" aria-label="Primary navigation">
    {#each primaryNavigation as item (item.label)}
      <a
        href={item.href}
        target={item.external ? '_blank' : undefined}
        rel={item.external ? 'noreferrer' : undefined}
      >
        {item.label}
      </a>
    {/each}
  </nav>

  <div class="theme-control" role="group" aria-label="Theme mode">
    {#each themeModes as mode (mode)}
      <button
        type="button"
        class:active={themeMode === mode}
        aria-pressed={themeMode === mode}
        on:click={() => setThemeMode(mode)}
      >
        {mode}
      </button>
    {/each}
  </div>
</header>

<main id="main-content" class="site-main" aria-labelledby="site-title">
  {#if isHome}
    <section class="hero-shell">
      <div class="hero-copy">
        <p class="eyebrow">{homepageHero.category}</p>
        <h1 id="site-title">{homepageHero.h1}</h1>
        <p class="hero-lede">{homepageHero.value}</p>
        <div class="hero-actions" aria-label="Primary actions">
          {#each homepageHero.actions as action (action.label)}
            <a class={`button-link ${action.kind}`} href={action.href}>{action.label}</a>
          {/each}
        </div>
      </div>

      <aside class="proof-panel" aria-label={homepageProof.title}>
        <img
          src={proofImage}
          alt="VS Code showing Flavor Grenade wiki-link completion in an Obsidian Vault"
        />
        <div>
          <p class="proof-title">{homepageProof.title}</p>
          <p>{homepageProof.caption}</p>
          <ul>
            {#each homepageProof.lines as line (line)}
              <li>{line}</li>
            {/each}
          </ul>
        </div>
      </aside>
    </section>

    <section class="feature-section" aria-labelledby="feature-title">
      <p class="eyebrow">Product proof</p>
      <h2 id="feature-title">Built for vault work that has to stay precise</h2>
      <div class="feature-list">
        {#each featureHighlights as feature (feature.title)}
          <article class={`feature-item ${feature.signal}`}>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        {/each}
      </div>
    </section>
  {:else}
    <article class="docs-page">
      <header class="docs-hero">
        <p class="eyebrow">{activeRoute.pageType}</p>
        <h1 id="site-title">{activeRoute.h1}</h1>
        <p>{activePage.summary}</p>
      </header>

      <div class="docs-layout">
        <div class="docs-sections">
          {#each activePage.sections as section (section.heading)}
            <section class="docs-section">
              <h2>{section.heading}</h2>
              <p>{section.body}</p>

              {#if section.items?.length}
                <ul>
                  {#each section.items as item (item)}
                    <li>{item}</li>
                  {/each}
                </ul>
              {/if}

              {#if section.steps?.length}
                <ol>
                  {#each section.steps as step (step.title)}
                    <li>
                      <strong>{step.title}</strong>
                      <span>{step.body}</span>
                    </li>
                  {/each}
                </ol>
              {/if}

              {#if section.code}
                <pre><code>{section.code}</code></pre>
              {/if}
            </section>
          {/each}
        </div>

        <aside class="docs-related" aria-label="Related pages">
          <h2>Related</h2>
          {#each activeRoute.related as routeId (routeId)}
            <a href={routePath(routeId)}>{routeHeading(routeId)}</a>
          {/each}

          {#if activePage.links.length}
            <h2>Links</h2>
            {#each activePage.links as link (link.text)}
              {#if link.kind === 'route'}
                <a href={routePath(link.routeId)}>{link.text}</a>
              {:else}
                <a href={link.href}>{link.text}</a>
              {/if}
            {/each}
          {/if}
        </aside>
      </div>
    </article>
  {/if}
</main>

<footer class="site-footer">
  <div class="footer-brand">
    <img src={productIcon} alt="Flavor Grenade LSP product icon" />
    <div>
      <strong>Flavor Grenade LSP</strong>
      <p>{footerByline}</p>
    </div>
  </div>

  <nav aria-label="Creator links">
    <h2>Creator</h2>
    {#each profileLinks as link (link.href)}
      <a href={link.href}>{link.label}</a>
    {/each}
  </nav>

  <nav aria-label="Project links">
    <h2>Project</h2>
    {#each projectLinks as link (link.href)}
      <a href={link.href}>{link.label}</a>
    {/each}
  </nav>

  <nav aria-label="Inspiration links">
    <h2>Inspired by</h2>
    <p>
      Flavor Grenade credits these inspirations as lineage and prior art, not
      affiliation or endorsement.
    </p>
    {#each inspirationLinks as link (link.href)}
      <a href={link.href}>{link.label}</a>
    {/each}
  </nav>
</footer>
