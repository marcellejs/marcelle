<script>
  export let index;
  export let title;
  export let description;
  export let modules = [];
</script>

<style type="text/postcss">
  .left {
    @apply flex-grow p-1;
  }

  .right {
    @apply flex-shrink-0 p-4;
    width: 300px;
  }
</style>

<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex">
  <div class="sm:flex sm:items-start">
    <div class="left">
      <div class="card text-center">
        {#each modules as { id }}
          <div {id} />
        {/each}
      </div>
    </div>
    <div class="right">
      <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
        {index}. {title}
      </h3>
      <div class="mt-2">
        <p class="text-sm leading-5 text-gray-500">{description}</p>
      </div>
    </div>
  </div>
</div>
