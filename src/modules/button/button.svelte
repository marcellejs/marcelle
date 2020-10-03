<script>
  import Spinner from '../../ui/widgets/Spinner.svelte';

  export let title;
  export let text;
  export let down;
  export let loading;

  function startDown() {
    down.set(true);
  }

  function stopDown() {
    down.set(false);
  }
</script>

<svelte:body on:mouseup={$down && stopDown} />

<span class="card-title">{title}</span>
<div>
  <button class="btn" on:click on:mousedown={startDown}>
    {$text}
    {#if $loading}
      <Spinner />
    {/if}
  </button>
</div>
