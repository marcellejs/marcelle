<script lang="ts">
  import { ViewContainer } from '@marcellejs/design-system';
  import { Button } from '@marcellejs/design-system';
  import type { Subject } from 'rxjs';
  import { rxBind } from '../../utils/rxjs';

  export let title: string;
  export let text: Subject<string>;
  export let pressed: Subject<boolean>;
  export let loading: Subject<boolean>;
  export let disabled: Subject<boolean>;
  export let type: Subject<'default' | 'success' | 'warning' | 'danger'>;
  // pressed.set = pressed.next;

  $: bPressed = rxBind(pressed);
</script>

<ViewContainer {title} loading={$loading}>
  <div>
    <Button disabled={$disabled} type={$type} bind:pressed={$bPressed} on:click>{$text}</Button>
  </div>
</ViewContainer>
