<script lang="ts">
  import type { Component } from '@marcellejs/core';

  interface Props {
    index: number;
    title: string;
    description: string;
    components?: Array<Component[] | Component>;
  }

  let {
    index,
    title,
    description,
    components = []
  }: Props = $props();
</script>

<div class="bg-white px-4 pt-2 pb-4 sm:px-6 sm:pb-4 flex">
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
    <div class="components">
      <div class="text-center">
        {#each components as m}
          {#if Array.isArray(m)}
            <div class="flex flex-row flex-wrap items-stretch">
              {#each m as { id }}
                <div {id} class="flex-none xl:flex-1 w-full xl:w-auto"></div>
              {/each}
            </div>
          {:else}
            <div id={m.id}></div>
          {/if}
        {/each}
      </div>
    </div>
  </div>
</div>

<style type="text/postcss">
  .components {
    @apply grow p-1;
  }

  .desc {
    @apply shrink-0 p-4;
  }
</style>
