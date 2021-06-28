<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from './Button.svelte';

  export let name = 'name';
  export let sortable = false;
  export let sorting = { col: '', ascending: true };

  const dispatch = createEventDispatcher();

  let sortAscending = true;
  $: if (sorting.col === name) {
    sortAscending = sorting.ascending;
  }

  function sort() {
    sortAscending = !sortAscending;
    dispatch('sort', { col: name, ascending: sortAscending });
  }

</script>

<th>
  <span style="display: flex; justify-content: space-between; align-items: center;">
    <span style="margin-top: 0.5rem; margin-bottom: 0.5rem;">{name}</span>
    {#if sortable}
      {#if sortAscending}
        <Button round size="small" on:click={sort}>
          <!-- class:hover={hovering} -->
          <!-- class:active={isSorting} -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7l4-4m0 0l4 4m-4-4v18"
            />
          </svg>
        </Button>
      {:else}
        <Button round size="small" on:click={sort}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 17l-4 4m0 0l-4-4m4 4V3"
            />
          </svg>
        </Button>
      {/if}
    {/if}
  </span>
</th>

<style>
  th {
    text-align: left;
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    line-height: 1rem;
    font-weight: 500;
    color: rgb(107, 114, 128);
    letter-spacing: 0.05em;
  }

  :global(sl-icon-button::part(base)) {
    color: transparent;
  }

  :global(sl-icon-button.hover::part(base)) {
    color: var(--sl-color-gray-500);
  }

  :global(sl-icon-button.active::part(base)) {
    color: var(--sl-color-success-500);
  }

  :global(sl-icon-button::part(base):hover) {
    color: var(--sl-color-primary-500);
  }

</style>
