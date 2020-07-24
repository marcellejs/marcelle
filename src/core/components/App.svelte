<script>
  /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
  import { onMount, createEventDispatcher } from 'svelte';
  import { blur } from 'svelte/transition';

  const dispatch = createEventDispatcher();

  import Routie from './routie';
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
    let s = str.replace(/^\s+|\s+$/g, ''); // trim
    s = s.toLowerCase();

    // remove accents, swap ñ for n, etc
    const from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;';
    const to = 'aaaaeeeeiiiioooouuuunc------';
    for (let i = 0, l = from.length; i < l; i++) {
      s = s.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    s = s
      .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes

    return s;
  }

  $: dashboardNames = Object.keys(dashboards);
  $: dashboardSlugs = [''].concat(dashboardNames.slice(1).map(string2slug));

  // Routing
  const router = new Routie();
  router.route('settings', () => {
    showSettings = true;
    if (currentDashboard) dashboards[currentDashboard].destroy();
  });
  $: dashboardSlugs.forEach((slug, i) => {
    router.route(slug, () => {
      showSettings = false;
      if (currentDashboard === dashboardNames[i]) return;
      if (currentDashboard) dashboards[currentDashboard].destroy();
      currentDashboard = dashboardNames[i];
    });
  });
</script>

<style type="text/postcss">
  .app-container {
    @apply flex flex-col absolute top-0 left-0 w-screen min-h-screen z-10;
  }
  main.container {
    @apply max-w-none w-screen p-1 flex flex-row flex-no-wrap flex-grow bg-gray-100;
  }

  .active {
    @apply text-gray-900 border-b;
  }
</style>

<Tailwind />
{#if showApp}
  <div style="position: fixed; height: 100vh; overflow: scroll; width: 100vw; top:0; left:0">
    <div class="app-container" transition:blur={{ amount: 10 }}>
      <header class="bg-white text-gray-700 body-font border-b">
        <div class=" mx-auto flex flex-wrap p-2 flex-col md:flex-row items-center w-full">
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
          <nav
            class="md:mr-auto md:ml-4 md:py-1 md:pl-4 md:border-l md:border-gray-400 flex flex-wrap
            items-center text-base justify-center">
            {#each dashboardNames as dashboardName, index}
              <a
                href={`#${dashboardSlugs[index]}`}
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
                d="M17 16v4h-2v-4h-2v-3h6v3h-2zM1 9h6v3H1V9zm6-4h6v3H7V5zM3 0h2v8H3V0zm12
                0h2v12h-2V0zM9 0h2v4H9V0zM3 12h2v8H3v-8zm6-4h2v12H9V8z" />
            </svg>
          </a>
          <button
            on:click={quit}
            class="text-red-500 bg-transparent font-bold uppercase text-xs px-2 py-2 rounded-full
            outline-none mr-1 mb-1 hover:bg-red-500 hover:text-white">
            <svg
              class="fill-current inline-block h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.16 4.16l1.42 1.42A6.99 6.99 0 0 0 10 18a7 7 0 0 0 4.42-12.42l1.42-1.42a9 9 0 1
                1-11.69 0zM9 0h2v8H9V0z" />
            </svg>
          </button>
        </div>
      </header>

      <main class="container">
        {#if showSettings}
          <Settings />
        {:else if currentDashboard}
          <Dashboard dashboard={dashboards[currentDashboard]} />
        {/if}
      </main>

      <footer class="bg-white text-gray-700 body-font border-t">
        <div class="px-5 py-2 mx-full flex items-center justify-end sm:flex-row">
          <p class="text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4">
            © 2020 {author}
          </p>
        </div>
      </footer>
    </div>
  </div>
{/if}
