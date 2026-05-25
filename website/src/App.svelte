<script lang="ts">
  import { onMount } from 'svelte';

  import { getWebsitePageByPath } from './content/pages';
  import { getRouteById, websiteRoutes } from './content/routes';
  import {
    featureHighlights,
    homepageAssetPlacements,
    homepageHero,
    homepageInstallOptions,
    homepageProof,
    type FeatureSignal,
  } from './home/homepage';
  import {
    footerByline,
    inspirationLinks,
    profileLinks,
    projectLinks,
  } from './shell/footer';
  import { iconLabels, iconPath, type IconName } from './shell/icons';
  import { primaryNavigation, type NavigationItem } from './shell/navigation';
  import {
    nextThemeMode,
    readStoredTheme,
    resolveTheme,
    writeStoredTheme,
    type ThemeMode,
  } from './theme/theme';

  let themeMode: ThemeMode = 'system';
  let resolvedTheme = 'light';
  let activePath = '/';
  let navOpen = false;
  let openDropdownLabel: string | null = null;
  let selectedFeatureSignal: FeatureSignal = 'diagnostic';
  $: activePage = getWebsitePageByPath(activePath, websiteRoutes);
  $: activeRoute = getRouteById(activePage.routeId);
  $: isHome = activePage.routeId === 'home';
  $: selectedFeature =
    featureHighlights.find((feature) => feature.signal === selectedFeatureSignal) ??
    featureHighlights[0];
  $: themeIconPath = getIconPath(themeModeIcon(themeMode));
  $: themeIconLabel = iconLabels[themeModeIcon(themeMode)];
  const productIcon =
    homepageAssetPlacements.find((asset) => asset.placement === 'header')?.source ??
    '/assets/flavor-grenade-lsp-icon-097debba.png';
  const proofImage =
    homepageAssetPlacements.find((asset) => asset.placement === 'hero')?.source ??
    '/assets/wiki-link-completion-982775b8.png';

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

  function toggleThemeMode(): void {
    setThemeMode(nextThemeMode(themeMode));
  }

  function toggleNav(): void {
    navOpen = !navOpen;
  }

  function closeNav(): void {
    navOpen = false;
    openDropdownLabel = null;
  }

  function hasArticles(item: NavigationItem): boolean {
    return Boolean(item.children?.length);
  }

  function openDropdown(item: NavigationItem): void {
    if (hasArticles(item)) {
      openDropdownLabel = item.label;
    }
  }

  function closeDropdown(event?: FocusEvent): void {
    if (event?.currentTarget instanceof HTMLElement) {
      const nextTarget = event.relatedTarget;

      if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
        return;
      }
    }

    openDropdownLabel = null;
  }

  function handleNavigationKeydown(event: KeyboardEvent, item: NavigationItem): void {
    if (!hasArticles(item)) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openDropdown(item);
      document
        .getElementById(item.menuId ?? '')
        ?.querySelector<HTMLAnchorElement>('a')
        ?.focus();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      openDropdownLabel = null;
    }
  }

  function handleDropdownLinkKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') {
      return;
    }

    event.preventDefault();
    openDropdownLabel = null;
    (event.currentTarget as HTMLElement)
      .closest('.nav-item')
      ?.querySelector<HTMLAnchorElement>('.nav-link')
      ?.focus();
  }

  function themeModeIcon(mode: ThemeMode): IconName {
    if (mode === 'system') {
      return 'monitor';
    }

    return mode === 'light' ? 'sun' : 'moon';
  }

  function getIconPath(icon: IconName): string {
    return iconPath(icon);
  }

  function selectFeature(signal: FeatureSignal): void {
    selectedFeatureSignal = signal;
  }

  function routePath(routeId: string): string {
    return getRouteById(routeId as Parameters<typeof getRouteById>[0]).path;
  }

  function routeHeading(routeId: string): string {
    return getRouteById(routeId as Parameters<typeof getRouteById>[0]).h1;
  }

  function bodyParagraphs(body: string): string[] {
    return body.split(/\n\s*\n/).filter((paragraph) => paragraph.trim().length > 0);
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

  <button
    class="nav-toggle"
    type="button"
    aria-label="Toggle primary navigation"
    aria-expanded={navOpen}
    aria-controls="primary-navigation"
    on:click={toggleNav}
  >
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d={getIconPath('menu')} />
    </svg>
  </button>

  <nav
    id="primary-navigation"
    class="primary-nav"
    class:open={navOpen}
    aria-label="Primary navigation"
  >
    {#each primaryNavigation as item (item.label)}
      <div
        class="nav-item"
        class:has-dropdown={hasArticles(item)}
        class:open={openDropdownLabel === item.label}
        on:focusout={closeDropdown}
      >
        <a
          class="nav-link"
          href={item.href}
          target={item.external ? '_blank' : undefined}
          rel={item.external ? 'noreferrer' : undefined}
          aria-haspopup={hasArticles(item) ? 'true' : undefined}
          aria-expanded={hasArticles(item) ? openDropdownLabel === item.label : undefined}
          aria-controls={item.menuId}
          on:focus={() => openDropdown(item)}
          on:keydown={(event) => handleNavigationKeydown(event, item)}
          on:click={closeNav}
        >
          {item.label}
        </a>

        {#if item.children?.length}
          <div
            id={item.menuId}
            class="nav-dropdown"
            aria-label={`${item.label} article links`}
          >
            {#each item.children as article (article.routeId)}
              <a
                class="nav-dropdown-link"
                href={article.href}
                on:keydown={handleDropdownLinkKeydown}
                on:click={closeNav}
              >
                <span>{article.label}</span>
                <small>{article.description}</small>
              </a>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </nav>

  <button
    class="theme-toggle"
    type="button"
    aria-label={`Theme mode: ${themeMode}. Activate to switch to ${nextThemeMode(themeMode)}.`}
    title={`Theme: ${themeMode}`}
    on:click={toggleThemeMode}
  >
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d={themeIconPath} />
    </svg>
    <span class="visually-hidden">{themeIconLabel}</span>
  </button>
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
            <a class={`button-link ${action.kind}`} href={action.href}>
              <span class="button-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d={getIconPath(action.icon)} />
                </svg>
              </span>
              <span>{action.label}</span>
            </a>
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

    <section class="install-section" aria-labelledby="install-title">
      <p class="eyebrow">Install</p>
      <h2 id="install-title">Choose the package that matches who is using the server</h2>
      <div class="install-grid">
        {#each homepageInstallOptions as option (option.title)}
          <a class="install-card" href={option.href}>
            <span class="install-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d={getIconPath(option.icon)} />
              </svg>
            </span>
            <span class="install-card-copy">
              <strong>{option.title}</strong>
              <span>{option.audience}</span>
            </span>
            <code>{option.commands.join('\n')}</code>
          </a>
        {/each}
      </div>
    </section>

    <section class="feature-section" aria-labelledby="feature-title">
      <p class="eyebrow">Product proof</p>
      <h2 id="feature-title">Built for vault work that has to stay precise</h2>
      <div class="feature-list">
        {#each featureHighlights as feature (feature.title)}
          <div
            class="feature-card"
            class:selected={selectedFeatureSignal === feature.signal}
          >
            <button
              class={`feature-item ${feature.signal}`}
              class:selected={selectedFeatureSignal === feature.signal}
              type="button"
              aria-pressed={selectedFeatureSignal === feature.signal}
              aria-expanded={selectedFeatureSignal === feature.signal}
              aria-controls="feature-detail"
              on:click={() => selectFeature(feature.signal)}
            >
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </button>

            {#if selectedFeatureSignal === feature.signal}
              <div class="mobile-feature-detail">
                <p class="eyebrow">How it works</p>
                <h3>{feature.detail.title}</h3>
                <p>{feature.detail.summary}</p>
                <pre><code>{feature.detail.markdownExample.join('\n')}</code></pre>
                <p>{feature.detail.outcome}</p>
              </div>
            {/if}
          </div>
        {/each}
      </div>

      <aside id="feature-detail" class="feature-detail" aria-live="polite">
        <p class="eyebrow">How it works</p>
        <h3>{selectedFeature.detail.title}</h3>
        <p>{selectedFeature.detail.summary}</p>
        <pre><code>{selectedFeature.detail.markdownExample.join('\n')}</code></pre>
        <p>{selectedFeature.detail.outcome}</p>
      </aside>
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
              {#each bodyParagraphs(section.body) as paragraph (paragraph)}
                <p>{paragraph}</p>
              {/each}

              {#if section.items?.length}
                <ul>
                  {#each section.items as item (item)}
                    <li>{item}</li>
                  {/each}
                </ul>
              {/if}

              {#if section.articleLinks?.length}
                <div class="article-link-grid" aria-label={`${section.heading} articles`}>
                  {#each section.articleLinks as article (article.routeId)}
                    <a class="article-link-card" href={routePath(article.routeId)}>
                      <span>{article.title}</span>
                      <small>{article.description}</small>
                    </a>
                  {/each}
                </div>
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
    <div class="footer-brand-copy">
      <strong>Flavor Grenade LSP</strong>
      <p>{footerByline}</p>
    </div>
  </div>

  <nav aria-label="Creator links">
    <h2>Creator</h2>
    {#each profileLinks as link (link.href)}
      <a class="footer-link" href={link.href}>
        {#if link.icon}
          <span class="link-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d={getIconPath(link.icon)} />
            </svg>
          </span>
        {/if}
        <span>{link.label}</span>
      </a>
    {/each}
  </nav>

  <nav aria-label="Project links">
    <h2>Project</h2>
    {#each projectLinks as link (link.href)}
      <a class="footer-link" href={link.href}>
        {#if link.icon}
          <span class="link-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d={getIconPath(link.icon)} />
            </svg>
          </span>
        {/if}
        <span>{link.label}</span>
      </a>
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
