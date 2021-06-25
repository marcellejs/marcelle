<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import Button from './Button.svelte';
  import Modal from './Modal.svelte';
  import { TableDataProvider } from './table-abstract-provider';

  export let provider: TableDataProvider;
  export let actions: string[];
  export let selected: number[];

  const dispatch = createEventDispatcher();

  let selectedAction = '';
  let confirmActionPending = false;

  function handleAction(action: string) {
    selectedAction = action;
    if (selectedAction && selected.length > 0) {
      confirmActionPending = true;
    }
  }

  async function confirmAction() {
    if (selectedAction === 'delete') {
      for (const i of selected) {
        await provider.delete(i);
      }
    } else {
      dispatch(selectedAction, selected);
    }
    confirmActionPending = false;
    selected = [];
    dispatch('selected', selected);
  }
</script>

<!-- <div class="table-actions"> -->
<div class="actions">
  {#each actions as action}
    <Button
      size="small"
      type={action === 'delete' ? 'danger' : 'default'}
      on:click={() => handleAction(action)}>{action}</Button
    >
  {/each}
</div>
<!-- </div> -->

{#if confirmActionPending}
  <Modal>
    <div class="p-8">
      <p>Do you want to {selectedAction} the selected items?</p>
      <div class="w-full flex justify-end">
        <Button
          type="danger"
          on:click={() => {
            confirmActionPending = false;
          }}>Cancel</Button
        >
        <span class="w-2" />
        <Button variant="filled" on:click={confirmAction}>Confirm</Button>
      </div>
    </div>
  </Modal>
{/if}
