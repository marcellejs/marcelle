<script lang="ts">
  import Spinner from '../ui/widgets/Spinner.svelte';

  export let title: string;
  export let loading = false;
</script>

<div class="card-container">
  <span class="card-title">{title}</span>
  {#if loading}
    <Spinner />
  {/if}
  <slot />
</div>

<style lang="postcss">
  .card-container {
    @apply flex flex-col justify-start flex-grow w-full;
  }

  .card-title {
    @apply block text-indigo-600 mb-2 text-xs;
  }
</style>
