<script lang="ts">
  import { Spinner, Progress } from '@marcellejs/design-system';

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
    <Spinner />
  {/if}
  <slot />
</div>

<style lang="postcss">
  .card-container {
    @apply flex flex-col justify-start grow w-full;
  }
</style>
