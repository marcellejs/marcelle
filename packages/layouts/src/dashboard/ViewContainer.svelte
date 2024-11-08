<script lang="ts">
  import type { BehaviorSubject } from 'rxjs';

  export let title: string;
  export let loading: BehaviorSubject<boolean> = undefined;
</script>

<div
  class="mly-card my-2 w-full flex-none overflow-hidden bg-base-100 p-3 shadow-md xl:w-auto xl:flex-1"
>
  {#if title}
    <h2 class="mly-card-title mb-4">{title}</h2>
  {/if}
  {#if loading && $loading}
    <span
      class="absolute inset-0 z-50 flex w-full flex-nowrap items-center justify-center bg-white bg-opacity-50"
    >
      <span class="mly-loading mly-loading-spinner mly-loading-lg"></span>
    </span>
  {/if}
  <slot />
</div>
