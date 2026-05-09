<script lang="ts">
  import { onMount } from 'svelte';

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
    <span class="brand-icon" aria-hidden="true">FG</span>
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
    <p class="eyebrow">Website shell</p>
    <h1 id="site-title">Flavor Grenade LSP</h1>
    <p class="hero-lede">
      Language-server and VS Code extension tools for Obsidian Flavored
      Markdown vaults.
    </p>
  </section>
</main>
