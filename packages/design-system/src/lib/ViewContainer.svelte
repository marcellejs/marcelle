<script lang="ts">
  import Progress from './Progress.svelte';

  export let title: string;
  export let loading = false;
  export let progress: number | false = false;
</script>

<div class="card-container">
  {#if progress !== false}
    <div class="absolute top-0 left-0 right-0">
      <Progress {progress} thin />
    </div>
  {/if}
  <span class="card-title">{title}</span>
  {#if loading}
    <span
      class="absolute flex flex-nowrap items-center justify-center inset-0 w-full bg-white bg-opacity-50 z-50"
    >
      <span class="loading loading-spinner loading-lg"></span>
    </span>
  {/if}
  <slot />
</div>

<style lang="postcss">
  .card-container {
    @apply flex flex-col justify-start grow w-full;
  }
</style>
