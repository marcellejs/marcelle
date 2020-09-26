<script>
  import DatasetSettings from './DatasetSettings.svelte';

  export let datasets = [];
</script>

<style type="text/postcss">
  .left {
    @apply flex-shrink-0 p-1;
    width: 350px;
  }

  .right {
    @apply flex-grow p-1;
  }
</style>

<div class="left">
  <!-- <h2>There will be some serious settings here.</h2> -->
</div>
<div class="right">
  {#each datasets as dataset}
    <DatasetSettings {dataset} count={dataset.$count} classes={dataset.$classes} />
  {/each}
</div>
