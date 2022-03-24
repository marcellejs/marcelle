<script lang="ts">
  import type { Stream } from '../../core';
  import ViewContainer from '../../core/ViewContainer.svelte';
  import { Button } from '@marcellejs/design-system';

  export let title: string;
  export let text: Stream<string>;
  export let pressed: Stream<boolean>;
  export let loading: Stream<boolean>;
  export let disabled: Stream<boolean>;
  export let type: Stream<'default' | 'success' | 'warning' | 'danger'>;
</script>

<ViewContainer {title} loading={$loading}>
  <div>
    <Button disabled={$disabled} type={$type} bind:pressed={$pressed} on:click>{$text}</Button>
  </div>
</ViewContainer>
