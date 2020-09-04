<script>
  import { onDestroy, createEventDispatcher } from 'svelte';
  import { createPopper } from '@popperjs/core';

  const dispatch = createEventDispatcher();

  export let actions = [];

  let dropdownPopoverShow = false;
  let referenceElement;
  let popperElement;
  let styles = {};
  let attributes = {};

  let popper;

  onDestroy(() => {
    if (popper) {
      popper.destroy();
    }
  });

  function toggleDropdown(e) {
    e.stopPropagation();
    if (dropdownPopoverShow) {
      dropdownPopoverShow = false;
    } else {
      dropdownPopoverShow = true;
      if (!popper && referenceElement && popperElement) {
        popper = createPopper(referenceElement, popperElement, {
          placement: 'bottom-end',
        });
      }
    }
  }

  function selectAction(code) {
    dispatch('select', code);
  }
</script>

<style>
  .actions {
    @apply text-sm text-gray-600 bg-transparent font-bold uppercase rounded-full outline-none pr-1;
  }

  .actions:hover {
    @apply text-gray-800;
  }
</style>

<svelte:body
  on:click={() => {
    dropdownPopoverShow = false;
  }} />

<div>
  <button class="actions" on:click={toggleDropdown} bind:this={referenceElement}>
    <svg
      class="fill-current inline-block h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"><path
        d="M10 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" /></svg>
  </button>
  <div
    bind:this={popperElement}
    class:hidden={!dropdownPopoverShow}
    class:block={dropdownPopoverShow}
    class="bg-white float-left text-base z-50 py-2 list-none border border-gray-100 text-left
      rounded shadow-2xl"
    role="tooltip">
    {#each actions as action}
      <button
        on:click={selectAction(action.code)}
        class="text-sm py-2 px-4 font-normal block w-full whitespace-no-wrap bg-transparent
          text-gray-800">
        {action.text}
      </button>
    {/each}
  </div>
</div>
