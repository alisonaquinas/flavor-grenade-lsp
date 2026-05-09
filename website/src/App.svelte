<script lang="ts">
  import { onMount } from 'svelte';

  import {
    featureHighlights,
    homepageHero,
    homepageProof,
  } from './home/homepage';
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

  onMount(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

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
</main>
