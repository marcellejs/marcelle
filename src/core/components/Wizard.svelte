<script>
  import { onDestroy, afterUpdate, createEventDispatcher } from 'svelte';
  import WizardStep from './WizardStep.svelte';

  import Tailwind from './Tailwind.svelte';

  export let steps;
  export let current;

  function stepTo(index) {
    if (index >= 0 && index <= steps.length - 1) {
      steps[current.value].modules.forEach(m => {
        m.destroy();
      });
      current.set(index);
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

  const dispatch = createEventDispatcher();
  export function quit() {
    dispatch('quit');
  }
</script>

<style type="text/postcss">
  .step-button {
    @apply w-2 h-2 p-0 mx-1 border-none rounded-full bg-blue-300;
  }

  .step-button.current,
  .step-button:hover {
    @apply bg-blue-500;
  }
</style>

<Tailwind />
<div
  class="wizard fixed bottom-0 inset-x-0 px-4 pb-4 sm:inset-0 sm:flex sm:items-center
  sm:justify-center z-20">
  <div class="fixed inset-0 transition-opacity">
    <div class="absolute inset-0 bg-gray-500 opacity-50" />
  </div>
  <div
    class="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-3xl
    sm:w-full">
    <WizardStep
      title={steps[$current].attr.title}
      description={steps[$current].attr.description}
      modules={steps[$current].modules}
      index={$current + 1} />
    <div class="bg-white border-t border-gray-300 px-4 py-2 grid grid-cols-3">
      <div>
        <button class="btn danger" on:click={quit}>Close</button>
      </div>
      <div class="text-center">
        {#each Array(steps.length) as _, i}
          <button on:click={() => stepTo(i)} class="step-button" class:current={$current === i} />
        {/each}
      </div>
      <div class="text-right">
        <button
          class="btn"
          disabled={$current <= 0}
          on:click={() => {
            stepTo($current - 1);
          }}>
          Previous
        </button>
        <button
          class="btn"
          disabled={$current >= steps.length - 1}
          on:click={() => {
            stepTo($current + 1);
          }}>
          Next
        </button>
      </div>
    </div>
  </div>
</div>
