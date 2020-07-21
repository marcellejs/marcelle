<script>
  /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
  import { onMount, onDestroy, afterUpdate, createEventDispatcher } from 'svelte';
  import WizardStep from './WizardStep.svelte';

  const dispatch = createEventDispatcher();

  // import Routie from './routie';
  import Tailwind from './Tailwind.svelte';

  export let steps;
  export let current;

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

  // let showSettings = false;
  // let currentDashboard = Object.keys(dashboards)[0] || undefined;

  // function string2slug(str) {
  //   let s = str.replace(/^\s+|\s+$/g, ''); // trim
  //   s = s.toLowerCase();

  //   // remove accents, swap ñ for n, etc
  //   const from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;';
  //   const to = 'aaaaeeeeiiiioooouuuunc------';
  //   for (let i = 0, l = from.length; i < l; i++) {
  //     s = s.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  //   }

  //   s = s
  //     .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
  //     .replace(/\s+/g, '-') // collapse whitespace and replace by -
  //     .replace(/-+/g, '-'); // collapse dashes

  //   return s;
  // }

  // $: dashboardNames = Object.keys(dashboards);
  // $: dashboardSlugs = [''].concat(dashboardNames.slice(1).map(string2slug));

  // // Routing
  // const router = new Routie();
  // router.route('settings', () => {
  //   showSettings = true;
  //   if (currentDashboard) dashboards[currentDashboard].destroy();
  // });
  // $: dashboardSlugs.forEach((slug, i) => {
  //   router.route(slug, () => {
  //     showSettings = false;
  //     if (currentDashboard === dashboardNames[i]) return;
  //     if (currentDashboard) dashboards[currentDashboard].destroy();
  //     currentDashboard = dashboardNames[i];
  //   });
  // });

  function previous() {
    if (current.value > 0) {
      steps[current.value].modules.forEach(m => {
        m.destroy();
      });
      current.set(current.value - 1);
    }
  }

  function next() {
    if (current.value < steps.length - 1) {
      steps[current.value].modules.forEach(m => {
        m.destroy();
      });
      current.set(current.value + 1);
    }
  }

  afterUpdate(() => {
    steps[current.value].modules.forEach(m => {
      m.mount();
    });
  });

  onDestroy(() => {
    steps[current.value].modules.forEach(m => {
      m.destroy();
    });
  });
</script>

<style type="text/postcss">
  /* .app-container {
    @apply flex flex-col absolute top-0 left-0 w-screen min-h-screen z-10;
  }
  main.container {
    @apply max-w-none w-screen p-1 flex flex-row flex-no-wrap flex-grow bg-gray-100;
  }

  .active {
    @apply text-gray-900 border-b;
  } */

  .left {
    @apply flex-shrink-0 p-1;
    width: 350px;
  }

  .right {
    @apply flex-grow p-1;
  }
</style>

<Tailwind />
<div
  class="wizard fixed bottom-0 inset-x-0 px-4 pb-4 sm:inset-0 sm:flex sm:items-center
  sm:justify-center z-20">
  <!--
    Background overlay, show/hide based on modal state.

    Entering: "ease-out duration-300"
      From: "opacity-0"
      To: "opacity-100"
    Leaving: "ease-in duration-200"
      From: "opacity-100"
      To: "opacity-0"
  -->
  <div class="fixed inset-0 transition-opacity">
    <div class="absolute inset-0 bg-gray-500 opacity-50" />
  </div>

  <!--
    Modal panel, show/hide based on modal state.

    Entering: "ease-out duration-300"
      From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      To: "opacity-100 translate-y-0 sm:scale-100"
    Leaving: "ease-in duration-200"
      From: "opacity-100 translate-y-0 sm:scale-100"
      To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
  -->
  <div
    class="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-3xl
    sm:w-full">
    <WizardStep
      title={steps[$current].attr.title}
      description={steps[$current].attr.description}
      modules={steps[$current].modules}
      index={$current + 1} />
    <div class="bg-gray-50 px-4 py-3 sm:px-6 flex flex-row justify-between">
      <div>
        <span class="flex w-full rounded-md shadow-sm sm:ml-3">
          <button class="danger" on:click={quit}>Close</button>
        </span>
      </div>
      <div class="flex">
        <span class="mt-3 flex w-full rounded-md shadow-sm sm:mt-0">
          <button disabled={$current <= 0} on:click={previous}>Previous</button>
        </span>
        <span class="flex w-full rounded-md shadow-sm sm:ml-3">
          <button disabled={$current >= steps.length - 1} on:click={next}>Next</button>
        </span>
      </div>
    </div>
  </div>
</div>
