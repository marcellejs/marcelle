<script lang="ts">
  import Spinner from '../ui/components/Spinner.svelte';

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

</style>
