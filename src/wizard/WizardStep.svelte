<script lang="ts">
  import type { Module } from '../core';

  export let index: number;
  export let title: string;
  export let description: string;
  export let modules: Array<Module[] | Module> = [];
</script>

<style type="text/postcss">
  .modules {
    @apply flex-grow p-1;
  }

  .desc {
    @apply flex-shrink-0 p-4;
    /* width: 300px; */
  }
</style>

<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex">
  <div class="flex flex-col w-full">
    <div class="desc">
      <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
        {index}.
        {title}
      </h3>
      <div class="mt-2">
        <p class="text-sm leading-5 text-gray-500">{description}</p>
      </div>
    </div>
    <div class="modules">
      <div class="card text-center">
        {#each modules as m}
          {#if Array.isArray(m)}
            <div class="flex flex-row flex-wrap items-stretch">
              {#each m as { id }}
                <div {id} class="flex-none xl:flex-1 w-full xl:w-auto" />
              {/each}
            </div>
          {:else}
            <div id={m.id} />
          {/if}
        {/each}
      </div>
    </div>
  </div>
</div>
