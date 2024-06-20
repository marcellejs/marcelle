<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button } from '@marcellejs/design-system';

  export let title: string;
  export let items: Record<string, string>;
  export let current: string;
  export let closable: boolean;
  export let showSettings = false;

  const dispatch = createEventDispatcher();

  function toggleSettings() {
    if (showSettings) {
      window.location.href =
        window.location.href.split('#')[0] +
        '#' +
        Object.keys(items)[Object.values(items).indexOf(current)];
    } else {
      window.location.href = window.location.href.split('#')[0] + '#settings';
    }
  }

  export function quit(): void {
    setTimeout(() => {
      dispatch('quit');
    }, 400);
  }
</script>

<header class="bg-white text-gray-700 body-font">
  <div class="mx-auto flex flex-wrap flex-col md:flex-row items-stretch w-full">
    <a
      href="#/"
      class="flex p-3 title-font font-medium items-center text-gray-900 mb-4 md:mb-0 border-solid border-0 border-r border-gray-200"
    >
      <span class="mx-3 text-lg">{title}</span>
    </a>
    <nav class="flex items-stretch justify-start flex-wrap text-base grow mx-4">
      {#each Object.entries(items) as [slug, name]}
        <a
          href={`#${slug}`}
          class:active={!showSettings && current === name}
          class="ml-2 mr-5 flex items-center hover:text-black border-solid border-0 border-b-2 border-transparent"
        >
          {name}
        </a>
      {/each}
    </nav>
    <div class="flex items-center">
      <Button round on:click={toggleSettings}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="feather feather-settings"
          ><circle cx="12" cy="12" r="3" /><path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
          /></svg
        >
      </Button>
      <span class="w-1" />
      {#if closable}
        <Button round type="danger" on:click={quit}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="feather feather-power"
            ><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" /></svg
          >
        </Button>
        <span class="w-1" />
      {/if}
    </div>
  </div>
</header>

<style lang="postcss">
  a {
    color: inherit;
    text-decoration: inherit;
  }

  .active {
    @apply text-gray-900 border-green-500;
  }
</style>
