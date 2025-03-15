<script lang="ts">
  import type { Subject } from 'rxjs';

  interface Props {
    text: Subject<string>;
    pressed: Subject<boolean>;
    disabled: Subject<boolean>;
    type: Subject<'default' | 'success' | 'warning' | 'danger'>;
    round?: boolean;
    onclick: (e: Event) => void;
  }

  let { text, pressed, disabled, type, round = false, onclick }: Props = $props();

  function startDown(e: Event) {
    e.preventDefault();
    pressed.next(true);
  }

  function stopDown() {
    if (pressed) {
      pressed.next(false);
    }
  }

  function fireClick(e: Event) {
    onclick(e);
  }
</script>

<svelte:body onmouseup={stopDown} ontouchend={stopDown} />

<div>
  <button
    class="mgui:btn"
    class:mgui:btn-disabled={$disabled}
    disabled={$disabled}
    class:mgui:btn-rounded={round}
    class:mgui:btn-error={$type === 'danger'}
    class:mgui:btn-success={$type === 'success'}
    class:mgui:btn-warning={$type === 'warning'}
    onmousedown={startDown}
    ontouchstart={startDown}
    ontouchend={fireClick}
    {onclick}
  >
    {$text}
  </button>
</div>
