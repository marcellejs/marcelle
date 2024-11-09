<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import WizardPageComponent from './WizardPage.svelte';
  import type { WizardPage } from './wizard_page';
  import { BehaviorSubject, Subscription } from 'rxjs';

  interface Props {
    pages: WizardPage[];
    current: BehaviorSubject<number>;
    onquit: () => void;
  }

  let { pages, current, onquit }: Props = $props();

  function goToPage(index: number) {
    if (index >= 0 && index <= pages.length - 1) {
      dispose();
      current.next(index);
    }
  }

  let destroy: Array<() => void> = [];
  function dispose() {
    console.log('destroy', destroy);
    for (const f of destroy) {
      f();
    }
    sub.unsubscribe();
  }

  let sub: Subscription;
  onMount(() => {
    sub = current.subscribe(async (c) => {
      await tick();
      console.log('HERE', c, pages[c]);
      destroy = [];
      for (const m of pages[c].components) {
        if (Array.isArray(m)) {
          for (const n of m) {
            destroy.push(n.mount());
          }
        } else {
          destroy.push(m.mount());
        }
      }
    });
  });

  onDestroy(() => {
    dispose();
  });

  export function quit(): void {
    onquit();
  }

  function handleKeyPress(e: KeyboardEvent) {
    e.preventDefault();
    if (e.key === 'Escape') {
      quit();
    }
  }
</script>

<div class="wizard">
  <div class="absolute inset-0 min-h-screen transition-opacity">
    <div
      onclick={quit}
      onkeypress={handleKeyPress}
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
          <button
            onclick={() => goToPage(i)}
            class="page-button"
            class:current={$current === i}
            aria-label="Go to page {i}"
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
