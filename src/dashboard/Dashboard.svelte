<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { blur } from 'svelte/transition';
  import Routie from './routie';
  import DashboardPageComponent from './DashboardPage.svelte';
  import DashboardSettingsComponent from './DashboardSettings.svelte';
  import type { DashboardPage } from './dashboard_page';
  import type { Stream } from '../core';
  import type { DashboardSettings } from './dashboard_settings';
  import DashboardHeader from './DashboardHeader.svelte';
  import DashboardFooter from './DashboardFooter.svelte';

  const dispatch = createEventDispatcher();

  export let title: string;
  export let author: string;
  export let dashboards: Record<string, DashboardPage> = {};
  export let settings: DashboardSettings;
  export let page: Stream<string>;
  export let closable: boolean;

  let showApp = false;

  onMount(() => {
    showApp = true;
  });

  export function quit(): void {
    showApp = false;
    setTimeout(() => {
      dispatch('quit');
    }, 400);
  }

  let showSettings = false;
  let currentDashboard = Object.keys(dashboards)[0] || undefined;

  function string2slug(str: string) {
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
  onMount(() => {
    try {
      const router = new Routie();
      router.route('settings', () => {
        showSettings = true;
        if (currentDashboard) dashboards[currentDashboard].destroy();
        page.set('settings');
      });
      dashboardSlugs.forEach((slug, i) => {
        router.route(slug, () => {
          showSettings = false;
          if (currentDashboard === dashboardNames[i]) return;
          if (currentDashboard) dashboards[currentDashboard].destroy();
          currentDashboard = dashboardNames[i];
          page.set(slug === '' ? string2slug(dashboardNames[0]) : slug);
        });
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Could not enable router', error);
    }
  });

</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

{#if showApp}
  <div class="marcelle fixed h-screen w-screen overflow-scroll top-0 left-0">
    <div class="app-container" transition:blur={{ amount: 10, duration: closable ? 400 : 0 }}>
      <DashboardHeader
        {title}
        items={dashboardSlugs.reduce((o, x, i) => ({ ...o, [x]: dashboardNames[i] }), {})}
        current={currentDashboard}
        {showSettings}
        {closable}
        on:quit={quit}
      />

      <main class="main-container">
        {#if showSettings}
          <DashboardSettingsComponent {settings} />
        {:else if currentDashboard}
          <DashboardPageComponent dashboard={dashboards[currentDashboard]} />
        {/if}
      </main>

      <DashboardFooter {author} />
    </div>
  </div>
{/if}

<style lang="postcss">
  .app-container {
    @apply flex flex-col absolute top-0 left-0 w-screen min-h-screen z-10;
  }

  .main-container {
    @apply box-border w-full p-1 flex flex-col flex-nowrap flex-grow bg-gray-100;
    background-color: rgb(237, 242, 247);
  }

  @screen lg {
    .main-container {
      @apply flex-row;
    }
  }

</style>
