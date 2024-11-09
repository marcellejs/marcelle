<script lang="ts">
  import Header from '$lib/header/Header.svelte';
  import './styles.css';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  const children_render = $derived(children);
</script>

<Header />

<main>
  {@render children_render?.()}
</main>

<footer>
  <p>
    visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit || visit
    <a href="https://marcelle.dev">marcelle.dev</a> to learn Marcelle
  </p>
</footer>

<style>
  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: 100%;
    max-width: 1024px;
    margin: 0 auto;
    box-sizing: border-box;
  }

  footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px;
  }

  footer a {
    font-weight: bold;
  }

  @media (min-width: 480px) {
    footer {
      padding: 40px 0;
    }
  }
</style>
