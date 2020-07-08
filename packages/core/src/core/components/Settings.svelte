<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
</script>

<div>
  <button class="danger" on:click={() => dispatch('quit')}>Quit</button>
</div>
