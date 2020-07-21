<script>
  export let title;
  export let text;
  export let down;

  function startDown() {
    down.set(true);
  }

  function stopDown() {
    down.set(false);
  }
</script>

<svelte:body on:mouseup={$down && stopDown} />

<span class="card-title">{title}</span>
<button class="btn" on:click on:mousedown={startDown}>{$text}</button>
