<script lang="ts">
  import Spinner from '../ui/widgets/Spinner.svelte';

  export let title: string;
  export let loading = false;
</script>

<style lang="postcss">
  .card-title {
    @apply block text-indigo-600 mb-2 text-xs;
  }
</style>

<div class="flex flex-col justify-start flex-grow w-full">
  <span class="card-title">{title}</span>
  {#if loading}
    <Spinner />
  {/if}
  <slot />
</div>
