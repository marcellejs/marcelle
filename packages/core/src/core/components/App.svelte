<script>
  import { onMount, onDestroy } from 'svelte';
  import { blur } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  import routie from './routie';
  import Tailwind from './Tailwind.svelte';
  import Dashboard from './Dashboard.svelte';
  import Settings from './Settings.svelte';

  export let title;
  export let author;
  export let dashboards = {};

  let showApp = false;

  onMount(() => {
    showApp = true;
  });

  export function quit() {
    showApp = false;
    setTimeout(() => {
      dispatch('quit');
    }, 400);
  }

  let showSettings = false;
  let currentDashboard = Object.keys(dashboards)[0] || undefined;

  function string2slug(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    var from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;';
    var to = 'aaaaeeeeiiiioooouuuunc------';
    for (var i = 0, l = from.length; i < l; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str
      .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes

    return str;
  }

  $: dashboardNames = Object.keys(dashboards);
  $: dashboardSlugs = [''].concat(dashboardNames.slice(1).map(string2slug));

  // Routing
  routie('settings', () => {
    showSettings = true;
  });
  $: dashboardSlugs.forEach((slug, i) => {
    routie(slug, () => {
      showSettings = false;
      if (currentDashboard === dashboardNames[i]) return;
      currentDashboard && dashboards[currentDashboard].destroy();
      currentDashboard = dashboardNames[i];
      dashboards[currentDashboard].mount();
    });
  });
</script>

<style type="text/postcss">
  .app-container {
    @apply flex flex-col absolute top-0 left-0 w-screen min-h-screen z-10 bg-white;
  }
  .container {
    @apply max-w-none w-screen p-1 flex flex-row flex-no-wrap flex-grow;
  }

  .active {
    @apply text-gray-900 border-b;
  }
</style>

<Tailwind />
{#if showApp}
  <div class="app-container" transition:blur={{ amount: 10 }}>
    <header class="text-gray-700 body-font border-b">
      <div class="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <a href="#/" class="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            class="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full"
            viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span class="ml-3 text-xl">{title}</span>
        </a>
        <!-- <nav class="md:ml-auto md:mr-auto flex flex-wrap items-center text-base justify-center"> -->
        <nav
          class="md:mr-auto md:ml-4 md:py-1 md:pl-4 md:border-l md:border-gray-400 flex flex-wrap
          items-center text-base justify-center">
          {#each dashboardNames as dashboardName, index}
            <a
              href={'#' + dashboardSlugs[index]}
              class:active={!showSettings && currentDashboard === dashboardName}
              class="mr-5 hover:text-gray-900 border-teal-500">
              {dashboardName}
            </a>
          {/each}
        </nav>
        <a
          href="#settings"
          class="text-teal-500 bg-transparent font-bold uppercase text-xs px-2 py-2 rounded-full
          outline-none mr-1 mb-1 hover:bg-teal-500 hover:text-white">
          <svg
            class="fill-current inline-block h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20">
            <path
              d="M3.94 6.5L2.22 3.64l1.42-1.42L6.5 3.94c.52-.3 1.1-.54 1.7-.7L9 0h2l.8 3.24c.6.16
              1.18.4 1.7.7l2.86-1.72 1.42 1.42-1.72 2.86c.3.52.54 1.1.7 1.7L20 9v2l-3.24.8c-.16.6-.4
              1.18-.7 1.7l1.72 2.86-1.42 1.42-2.86-1.72c-.52.3-1.1.54-1.7.7L11
              20H9l-.8-3.24c-.6-.16-1.18-.4-1.7-.7l-2.86 1.72-1.42-1.42
              1.72-2.86c-.3-.52-.54-1.1-.7-1.7L0 11V9l3.24-.8c.16-.6.4-1.18.7-1.7zM10 13a3 3 0 1 0
              0-6 3 3 0 0 0 0 6z" />
          </svg>
        </a>
      </div>
    </header>

    <div class="container">
      {#if showSettings}
        <Settings on:quit={quit} />
      {:else if currentDashboard}
        <Dashboard dashboard={dashboards[currentDashboard]} />
      {/if}
    </div>

    <footer class="text-gray-700 body-font border-t">
      <div class="px-5 py-2 mx-full flex items-center justify-end sm:flex-row">
        <p class="text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4">
          © 2020 {author}
        </p>
      </div>
    </footer>
  </div>
{/if}
