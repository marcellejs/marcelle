<script lang="ts">
  import type { BehaviorSubject } from 'rxjs';

  export let title: string;
  export let loading: BehaviorSubject<boolean> = undefined;
</script>

<div
  class="card bg-base-100 my-2 p-3 shadow-md overflow-hidden flex-none xl:flex-1 w-full xl:w-auto"
>
  {#if title}
    <h2 class="card-title mb-4">{title}</h2>
  {/if}
  {#if loading && $loading}
    <span
      class="absolute flex flex-nowrap items-center justify-center inset-0 w-full bg-white bg-opacity-50 z-50"
    >
      <span class="loading loading-spinner loading-lg"></span>
    </span>
  {/if}
  <slot />
</div>
