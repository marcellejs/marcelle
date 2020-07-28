<script>
  export let title;
  export let count;
  export let instances;
  export let instanceService;
</script>

<span class="card-title">{title}</span>
<p>This dataset contains {$count} instance{$count > 1 ? 's' : ''}.</p>

<div class="flex flex-wrap">
  {#each $instances as id}
    {#await instanceService.get(id, { query: { $select: ['thumbnail'] } }) then instance}
      <img src={instance.thumbnail} alt="thumbnail" class="p-1" />
    {/await}
  {/each}
</div>
