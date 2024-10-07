<script lang="ts">
  import { ViewContainer } from '@marcellejs/design-system';
  import type { Subject } from 'rxjs';
  import { createEventDispatcher } from 'svelte';

  export let title: string;
  export let text: Subject<string>;
  export let pressed: Subject<boolean>;
  export let loading: Subject<boolean>;
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

<ViewContainer {title} loading={$loading}>
  <div>
    <button
      class="btn"
      class:btn-disabled={$disabled}
      disabled={$disabled}
      class:btn-rounded={round}
      class:btn-error={$type === 'danger'}
      class:btn-success={$type === 'success'}
      class:btn-warning={$type === 'warning'}
      on:click
      on:mousedown={startDown}
      on:touchstart|preventDefault={startDown}
      on:touchend={fireClick}
      on:click>{$text}</button
    >
  </div>
</ViewContainer>
