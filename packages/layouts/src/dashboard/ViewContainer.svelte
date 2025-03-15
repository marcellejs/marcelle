<script lang="ts">
  import type { BehaviorSubject } from 'rxjs';

  interface Props {
    title: string;
    loading?: BehaviorSubject<boolean>;
    children?: import('svelte').Snippet;
  }

  let { title, loading = undefined, children }: Props = $props();

  const children_render = $derived(children);
</script>

<div
  class="mly:card mly:my-2 mly:w-full mly:flex-none mly:overflow-hidden mly:bg-base-100 mly:p-3 mly:shadow-md mly:xl:w-auto mly:xl:flex-1"
>
  {#if title}
    <h2 class="mly:card-title mly:mb-4">{title}</h2>
  {/if}
  {#if loading && $loading}
    <span
      class="mly:absolute mly:inset-0 mly:z-50 mly:flex mly:w-full mly:flex-nowrap mly:items-center mly:justify-center mly:bg-white mly:bg-opacity-50"
    >
      <span class="mly:loading mly:loading-spinner mly:loading-lg"></span>
    </span>
  {/if}
  {@render children_render?.()}
</div>
