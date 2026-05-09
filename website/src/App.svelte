<script lang="ts">
  import { getAppShellSummary } from './app-shell';

  const shell = getAppShellSummary();
</script>

<svelte:head>
  <title>{shell.productName}</title>
</svelte:head>

<main class="site-shell" aria-labelledby="site-title">
  <p class="eyebrow">Website foundation</p>
  <h1 id="site-title">{shell.productName}</h1>
  <p class="lede">
    Static GitHub Pages foundation for Obsidian Flavored Markdown docs, built
    with {shell.stack.join(', ')}.
  </p>
</main>
