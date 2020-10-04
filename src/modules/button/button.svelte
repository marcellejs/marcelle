<script>
  import ModuleBase from '../../core/ModuleBase.svelte';

  export let title;
  export let text;
  export let down;
  export let loading;
  export let disabled;
  export let type;

  function startDown() {
    down.set(true);
  }

  function stopDown() {
    down.set(false);
  }
</script>

<svelte:body on:mouseup={$down && stopDown} />

<ModuleBase {title} loading={$loading}>
  <div>
    <button
      class="btn"
      class:danger={$type === 'danger'}
      disabled={$disabled}
      on:click
      on:mousedown={startDown}>
      {$text}
    </button>
  </div>
</ModuleBase>
