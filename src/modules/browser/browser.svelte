<script>
  export let title;
  export let count;
  export let classes;
  export let instanceService;
</script>

<style>
  .browser-class {
    @apply relative flex flex-wrap justify-center flex-grow;
    @apply m-2 p-1 pt-8;
    @apply border-indigo-200 border-4 rounded-bl-lg rounded-tr-lg z-10;
    min-width: 400px;
  }

  .browser-class img {
    width: 60px;
    @apply border-gray-200 rounded-md;
  }

  .browser-class-title {
    @apply absolute top-0 pt-1 w-full text-center underline;
  }
</style>

<span class="card-title">{title}</span>
{#if $count > 0}
  <p class="ml-3 mt-2">This dataset contains {$count} instance{$count > 1 ? 's' : ''}.</p>
{:else}
  <p class="ml-3 mt-2">This dataset is empty.</p>
{/if}

<div class="flex flex-wrap">
  {#each Object.entries($classes) as [key, classInstances]}
    <div class="browser-class">
      <span class="browser-class-title">label: {key}</span>
      {#each classInstances as id}
        {#await instanceService.get(id, { query: { $select: ['thumbnail'] } }) then instance}
          <img src={instance.thumbnail} alt="thumbnail" class="p-1" />
        {/await}
      {/each}
    </div>
  {/each}
</div>
