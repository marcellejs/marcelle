<script lang="ts">
  import { onDestroy, afterUpdate, createEventDispatcher } from 'svelte';
  import type { Stream } from '../core';
  import { Button } from '@marcellejs/design-system';
  import WizardPageComponent from './WizardPage.svelte';
  import type { WizardPage } from './wizard_page';

  export let pages: WizardPage[];
  export let current: Stream<number>;

  function goToPage(index: number) {
    if (index >= 0 && index <= pages.length - 1) {
      for (const m of pages[current.value].components) {
        if (Array.isArray(m)) {
          for (const n of m) {
            n.destroy();
          }
        } else {
          m.destroy();
        }
      }
      current.set(index);
    }
  }

  afterUpdate(() => {
    for (const m of pages[current.value].components) {
      if (Array.isArray(m)) {
        for (const n of m) {
          n.mount();
        }
      } else {
        m.mount();
      }
    }
  });

  onDestroy(() => {
    for (const m of pages[current.value].components) {
      if (Array.isArray(m)) {
        for (const n of m) {
          n.destroy();
        }
      } else {
        m.destroy();
      }
    }
  });

  const dispatch = createEventDispatcher();
  export function quit(): void {
    dispatch('quit');
  }

  function onOutsideClick() {
    quit();
  }
</script>

<div class="marcelle wizard">
  <div class="absolute min-h-screen inset-0 transition-opacity">
    <div on:click={onOutsideClick} class="absolute inset-0 bg-gray-500 opacity-50" />
  </div>
  <div
    class="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-3xl
      sm:w-full"
  >
    <WizardPageComponent
      title={pages[$current].attr.title}
      description={pages[$current].attr.description}
      components={pages[$current].components}
      index={$current + 1}
    />
    <div class="bg-white border-t border-gray-300 px-4 py-2 grid grid-cols-3">
      <div><Button type="danger" on:click={quit}>Close</Button></div>
      <div class="text-center">
        {#each Array(pages.length) as _, i}
          <button on:click={() => goToPage(i)} class="page-button" class:current={$current === i} />
        {/each}
      </div>
      <div class="text-right">
        <Button
          disabled={$current <= 0}
          on:click={() => {
            goToPage($current - 1);
          }}
        >
          Previous
        </Button>
        <Button
          variant="filled"
          type={$current >= pages.length - 1 ? 'success' : 'default'}
          on:click={() => {
            if (current.value < pages.length - 1) {
              goToPage($current + 1);
            } else {
              quit();
            }
          }}
        >
          {$current >= pages.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  .wizard {
    @apply absolute min-h-screen top-0 inset-x-0 p-4 pb-4  z-20;
  }

  @screen sm {
    .wizard {
      @apply flex items-center justify-center;
    }
  }

  .wizard :global(.card-title) {
    display: none !important;
  }

  .page-button {
    @apply w-2 h-2 p-0 mx-1 border-none rounded-full bg-blue-300 cursor-pointer;
  }

  .page-button.current,
  .page-button:hover {
    @apply bg-blue-500;
  }
</style>
