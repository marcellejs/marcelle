<script lang="ts">
  import { preventDefault } from 'svelte/legacy';

  import { onDestroy, createEventDispatcher } from 'svelte';
  import WizardPageComponent from './WizardPage.svelte';
  import type { WizardPage } from './wizard_page';
  import { BehaviorSubject } from 'rxjs';

  interface Props {
    pages: WizardPage[];
    current: BehaviorSubject<number>;
  }

  let { pages, current }: Props = $props();

  function goToPage(index: number) {
    if (index >= 0 && index <= pages.length - 1) {
      for (const m of pages[current.getValue()].components) {
        if (Array.isArray(m)) {
          for (const n of m) {
            n.destroy();
          }
        } else {
          m.destroy();
        }
      }
      current.next(index);
    }
  }

  $effect(() => {
    for (const m of pages[current.getValue()].components) {
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
    for (const m of pages[current.getValue()].components) {
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
</script>

<div class="wizard">
  <div class="absolute inset-0 min-h-screen transition-opacity">
    <div
      onclick={quit}
      onkeypress={preventDefault((e) => e.key === 'Escape' && quit())}
      class="absolute inset-0 bg-gray-500 opacity-50"
      role="none"
    ></div>
  </div>
  <div
    class="transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:w-full
      sm:max-w-3xl"
  >
    <WizardPageComponent
      title={pages[$current].attr.title}
      description={pages[$current].attr.description}
      components={pages[$current].components}
      index={$current + 1}
    />
    <div class="grid grid-cols-3 border-t border-gray-300 bg-white px-4 py-2">
      <div>
        <button class="mly-btn mly-btn-outline mly-btn-error" onclick={quit}>Close</button>
      </div>
      <div class="text-center">
        <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
        {#each Array(pages.length) as _, i}
          <button onclick={() => goToPage(i)} class="page-button" class:current={$current === i}
          ></button>
        {/each}
      </div>
      <div class="text-right">
        <button
          class="mly-btn mly-btn-outline"
          disabled={$current <= 0}
          onclick={() => {
            goToPage($current - 1);
          }}
        >
          Previous
        </button>
        <button
          class="mly-btn"
          class:mly-btn-success={$current >= pages.length - 1}
          onclick={() => {
            if (current.getValue() < pages.length - 1) {
              goToPage($current + 1);
            } else {
              quit();
            }
          }}
        >
          {$current >= pages.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  .wizard {
    @apply absolute inset-x-0 top-0 z-20 min-h-screen p-4 pb-4;
  }

  @screen sm {
    .wizard {
      @apply flex items-center justify-center;
    }
  }

  .wizard :global(.mly-card-title) {
    display: none !important;
  }

  .page-button {
    @apply mx-1 h-2 w-2 cursor-pointer rounded-full border-none bg-blue-300 p-0;
  }

  .page-button.current,
  .page-button:hover {
    @apply bg-blue-500;
  }
</style>
