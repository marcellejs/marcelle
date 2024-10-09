<script lang="ts">
  import type { Action } from './table-types';
  import type { TableDataProvider } from './table-abstract-provider';
  import { createEventDispatcher } from 'svelte';

  export let provider: TableDataProvider;
  export let actions: Action[];
  export let selected: number[];

  const dispatch = createEventDispatcher();

  let modal: HTMLDialogElement;
  let selectedAction = '';

  async function confirmAction() {
    if (selectedAction === 'delete') {
      for (const i of selected) {
        await provider.delete(i);
      }
    } else {
      dispatch('action', [selectedAction, selected]);
    }

    selected = [];
    dispatch('selected', selected);
  }

  function handleAction(action: string, confirm: boolean) {
    selectedAction = action;
    if (!selectedAction || selected.length === 0) return;
    if (confirm) {
      modal.showModal();
    } else {
      confirmAction();
    }
  }
</script>

<!-- <div class="table-actions"> -->
<div class="actions">
  {#each actions as { name, multiple, confirm }}
    <button
      class="btn btn-sm"
      class:btn-disabled={multiple === false && selected.length > 1}
      class:btn-error={name === 'delete'}
      disabled={multiple === false && selected.length > 1}
      on:click={() => handleAction(name, confirm || false)}>{name}</button
    >
  {/each}
</div>
<!-- </div> -->

<dialog id="my_modal_2" class="modal" bind:this={modal}>
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    </form>
    <h3 class="text-lg font-bold">Confirmation required</h3>
    <p class="py-4">Do you want to {selectedAction} the selected items?</p>
    <div class="w-full flex justify-end">
      <button
        class="btn btn-ghost"
        on:click={() => {
          modal.close();
        }}>Cancel</button
      >
      <span class="w-2" />
      <button class="btn btn-primary" on:click={confirmAction}>Confirm</button>
    </div>
  </div>
</dialog>
