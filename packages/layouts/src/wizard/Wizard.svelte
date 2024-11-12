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
    for (const f of destroy) {
      f();
    }
  }

  let sub: Subscription;
  onMount(() => {
    sub = current.subscribe(async (c) => {
      await tick();
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
    sub.unsubscribe();
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
  <div class="mly-absolute mly-inset-0 mly-min-h-screen mly-transition-opacity">
    <div
      onclick={quit}
      onkeypress={handleKeyPress}
      class="absolute inset-0 bg-gray-500 opacity-50"
      role="none"
    ></div>
  </div>
  <div
    class="mly-transform mly-overflow-hidden mly-rounded-lg mly-bg-white mly-shadow-xl mly-transition-all sm:mly-w-full sm:mly-max-w-3xl"
  >
    <WizardPageComponent
      title={pages[$current].attr.title}
      description={pages[$current].attr.description}
      components={pages[$current].components}
      index={$current + 1}
    />
    <div
      class="mly-grid mly-grid-cols-3 mly-border-t mly-border-gray-300 mly-bg-white mly-px-4 mly-py-2"
    >
      <div>
        <button class="mly-btn mly-btn-outline mly-btn-error" onclick={quit}>Close</button>
      </div>
      <div class="mly-text-center">
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
      <div class="mly-text-right">
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
    @apply mly-absolute mly-inset-x-0 mly-top-0 mly-z-20 mly-min-h-screen mly-p-4 mly-pb-4;
  }

  @screen sm {
    .wizard {
      @apply mly-flex mly-items-center mly-justify-center;
    }
  }

  .wizard :global(.mly-card-title) {
    display: none !important;
  }

  .page-button {
    @apply mly-mx-1 mly-h-2 mly-w-2 mly-cursor-pointer mly-rounded-full mly-border-none mly-bg-blue-300 mly-p-0;
  }

  .page-button.current,
  .page-button:hover {
    @apply mly-bg-blue-500;
  }
</style>
