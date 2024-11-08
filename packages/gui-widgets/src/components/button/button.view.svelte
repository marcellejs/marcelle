<script lang="ts">
  import type { Subject } from 'rxjs';
  import { createEventDispatcher } from 'svelte';

  export let text: Subject<string>;
  export let pressed: Subject<boolean>;
  export let disabled: Subject<boolean>;
  export let type: Subject<'default' | 'success' | 'warning' | 'danger'>;

  export let round = false;

  const dispatch = createEventDispatcher();

  function startDown() {
    pressed.next(true);
  }

  function stopDown() {
    if (pressed) {
      pressed.next(false);
    }
  }

  function fireClick(e: Event) {
    dispatch('click', e);
  }
</script>

<svelte:body on:mouseup={stopDown} on:touchend={stopDown} />

<div>
  <button
    class="mgui-btn"
    class:mgui-btn-disabled={$disabled}
    disabled={$disabled}
    class:mgui-btn-rounded={round}
    class:mgui-btn-error={$type === 'danger'}
    class:mgui-btn-success={$type === 'success'}
    class:mgui-btn-warning={$type === 'warning'}
    on:mousedown={startDown}
    on:touchstart|preventDefault={startDown}
    on:touchend={fireClick}
    on:click>{$text}</button
  >
</div>
