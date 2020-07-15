<script>
  export let title;
  export let count;
  export let instances;
  export let instanceData;
</script>

<span class="card-title">{title}</span>
<p>This dataset contains {$count} instance{$count > 1 ? 's' : ''}.</p>

<div class="flex flex-wrap">
  {#each $instances as id}
    <img src={instanceData[id].thumbnail} alt="thumbnail" class="p-1" />
  {/each}
</div>
