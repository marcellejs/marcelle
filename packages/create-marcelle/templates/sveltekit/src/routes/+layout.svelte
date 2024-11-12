<script lang="ts">
  import Footer from '$lib/header/Footer.svelte';
  import Header from '$lib/header/Header.svelte';
  import '../app.css';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  const children_render = $derived(children);
</script>

<div class="flex flex-col min-h-screen justify-start">
  <Header />

  <div class="flex-1 bg-base-200">
    <main class="flex flex-col p-4 w-full max-w-5xl mx-auto">
      {@render children_render?.()}
    </main>
  </div>

  <Footer />
</div>

<style>
</style>
