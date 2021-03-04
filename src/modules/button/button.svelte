<script lang="ts">
  import type { Stream } from '../../core';
  import ModuleBase from '../../core/ModuleBase.svelte';

  export let title: string;
  export let text: Stream<string>;
  export let down: Stream<boolean>;
  export let loading: Stream<boolean>;
  export let disabled: Stream<boolean>;
  export let type: Stream<string>;

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
