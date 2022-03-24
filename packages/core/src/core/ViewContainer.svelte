<script lang="ts">
  import { Spinner } from '@marcellejs/design-system';

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
    @apply flex flex-col justify-start grow w-full;
  }
</style>
