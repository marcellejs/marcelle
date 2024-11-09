<script lang="ts">
  import { BehaviorSubject } from 'rxjs';
  import { onMount } from 'svelte';
  import { blur } from 'svelte/transition';
  import Routie from './routie';
  import DashboardPageComponent from './DashboardPage.svelte';
  import DashboardSettingsComponent from './DashboardSettings.svelte';
  import type { DashboardPage } from './dashboard_page';
  import type { DashboardSettings } from './dashboard_settings';
  import DashboardHeader from './DashboardHeader.svelte';
  import DashboardFooter from './DashboardFooter.svelte';

  interface Props {
    title: string;
    author: string;
    dashboards?: Record<string, DashboardPage>;
    settings: DashboardSettings;
    page: BehaviorSubject<string>;
    closable: boolean;
    onquit: () => void;
  }

  let { title, author, dashboards = {}, settings, page, closable, onquit }: Props = $props();

  let showApp = $state(false);

  onMount(() => {
    showApp = true;
  });

  export function quit(): void {
    showApp = false;
    setTimeout(() => {
      onquit();
    }, 400);
  }

  let showSettings = $state(false);
  let currentDashboard = $state(Object.keys(dashboards)[0] || undefined);

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

  let dashboardNames = $derived(Object.keys(dashboards));
  let dashboardSlugs = $derived([''].concat(dashboardNames.slice(1).map(string2slug)));

  // Routing
  onMount(() => {
    try {
      const router = new Routie();
      router.route('settings', () => {
        showSettings = true;
        if (currentDashboard) dashboards[currentDashboard].destroy();
        page.next('settings');
      });
      dashboardSlugs.forEach((slug, i) => {
        router.route(slug, () => {
          showSettings = false;
          if (currentDashboard === dashboardNames[i]) return;
          if (currentDashboard) dashboards[currentDashboard].destroy();
          currentDashboard = dashboardNames[i];
          page.next(slug === '' ? string2slug(dashboardNames[0]) : slug);
        });
      });
    } catch (error) {
      console.log('Could not enable router', error);
    }
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

{#if showApp}
  <div
    class="marcelle fixed left-0 top-0 z-40 h-screen w-full max-w-full overflow-x-hidden overflow-y-scroll"
  >
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
    @apply absolute left-0 top-0 z-10 flex min-h-screen w-full flex-col;
  }

  .main-container {
    @apply box-border flex w-full grow flex-col flex-nowrap bg-base-200 p-1;
  }

  @screen lg {
    .main-container {
      @apply flex-row;
    }
  }
</style>
