<script lang="ts">
  import type { Action } from './table-types';
  import type { TableDataProvider } from './table-abstract-provider';
  import { createEventDispatcher } from 'svelte';
  import Modal from './Modal.svelte';

  export let provider: TableDataProvider;
  export let actions: Action[];
  export let selected: number[];

  const dispatch = createEventDispatcher();

  let selectedAction = '';
  let confirmActionPending = false;

  async function confirmAction() {
    if (selectedAction === 'delete') {
      for (const i of selected) {
        await provider.delete(i);
      }
    } else {
      dispatch('action', [selectedAction, selected]);
    }
    confirmActionPending = false;
    selected = [];
    dispatch('selected', selected);
  }

  function handleAction(action: string, confirm: boolean) {
    selectedAction = action;
    if (!selectedAction || selected.length === 0) return;
    if (confirm) {
      confirmActionPending = true;
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

{#if confirmActionPending}
  <Modal>
    <div class="p-8">
      <p>Do you want to {selectedAction} the selected items?</p>
      <div class="w-full flex justify-end">
        <button
          class="btn btn-error"
          on:click={() => {
            confirmActionPending = false;
          }}>Cancel</button
        >
        <span class="w-2" />
        <button class="btn" on:click={confirmAction}>Confirm</button>
      </div>
    </div>
  </Modal>
{/if}
