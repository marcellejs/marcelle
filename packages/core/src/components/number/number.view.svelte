<script lang="ts">
  import type { Stream } from '../../core';
  import ViewContainer from '../../core/ViewContainer.svelte';
  import { Number } from '@marcellejs/design-system';

  export let title: string;
  export let value: Stream<number>;
  export let disabled: Stream<boolean>;
</script>

<ViewContainer {title}>
  <div class="w-full max-w-sm">
    <div class="md:flex md:items-center mb-2">
      <Number bind:value={$value} disabled={$disabled} />
    </div>
  </div>
</ViewContainer>
