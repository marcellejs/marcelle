<script lang="ts">
  import type { Component } from '@marcellejs/core';

  interface Props {
    index: number;
    title: string;
    description: string;
    components?: Array<Component[] | Component>;
  }

  let { index, title, description, components = [] }: Props = $props();
</script>

<div class="mly:bg-white mly:px-4 mly:pt-2 mly:pb-4 mly:sm:px-6 mly:sm:pb-4 mly:flex">
  <div class="mly:flex mly:flex-col mly:w-full">
    <div class="desc">
      <h3 class="mly:text-lg mly:leading-6 mly:font-medium mly:text-gray-900" id="modal-headline">
        {index}.
        {title}
      </h3>
      <div class="mly:mt-2">
        <p class="mly:text-sm mly:leading-5 mly:text-gray-500">{description}</p>
      </div>
    </div>
    <div class="components">
      <div class="mly:text-center">
        {#each components as m}
          {#if Array.isArray(m)}
            <div class="mly:flex mly:flex-row mly:flex-wrap mly:items-stretch">
              {#each m as { id }}
                <div {id} class="mly:flex-none mly:xl:flex-1 mly:w-full mly:xl:w-auto"></div>
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

<style lang="postcss">
  @reference "../styles.css";

  .components {
    @apply mly:grow mly:p-1;
  }

  .desc {
    @apply mly:shrink-0 mly:p-4;
  }
</style>
