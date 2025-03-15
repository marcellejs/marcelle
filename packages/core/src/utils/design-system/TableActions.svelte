<script lang="ts">
  import type { Action } from './table-types';
  import type { TableDataProvider } from './table-abstract-provider';
  import { createEventDispatcher } from 'svelte';

  interface Props {
    provider: TableDataProvider;
    actions: Action[];
    selected: number[];
  }

  let { provider, actions, selected = $bindable() }: Props = $props();

  const dispatch = createEventDispatcher();

  let modal: HTMLDialogElement = $state();
  let selectedAction = $state('');

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
  {#each actions as { name, multiple, confirm } (name)}
    <button
      class="mcl:btn mcl:btn-sm"
      class:mcl:btn-disabled={multiple === false && selected.length > 1}
      class:mcl:btn-error={name === 'delete'}
      disabled={multiple === false && selected.length > 1}
      onclick={() => handleAction(name, confirm || false)}>{name}</button
    >
  {/each}
</div>
<!-- </div> -->

<dialog id="my_modal_2" class="modal" bind:this={modal}>
  <div class="mcl:modal-box">
    <form method="dialog">
      <button
        class="mcl:btn mcl:btn-circle mcl:btn-ghost mcl:btn-sm mcl:absolute mcl:right-2 mcl:top-2"
      >
        ✕
      </button>
    </form>
    <h3 class="mcl:text-lg mcl:font-bold">Confirmation required</h3>
    <p class="mcl:py-4">Do you want to {selectedAction} the selected items?</p>
    <div class="mcl:flex mcl:w-full mcl:justify-end">
      <button
        class="mcl:btn mcl:btn-ghost"
        onclick={() => {
          modal.close();
        }}>Cancel</button
      >
      <span class="mcl:w-2"></span>
      <button class="mcl:btn mcl:btn-primary" onclick={confirmAction}>Confirm</button>
    </div>
  </div>
</dialog>
