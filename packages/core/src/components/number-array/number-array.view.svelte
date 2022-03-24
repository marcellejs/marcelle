<script lang="ts">
  import type { Stream } from '../../core';
  import ViewContainer from '../../core/ViewContainer.svelte';
  import NumberArray from '../../ui/components/NumberArray.svelte';

  export let title: string;
  export let value: Stream<number[]>;
  export let disabled: Stream<boolean>;
</script>

<ViewContainer {title}>
  <div class="w-full max-w-sm">
    <div class="md:flex md:items-center mb-2">
      <NumberArray bind:value={$value} disabled={$disabled} />
    </div>
  </div>
</ViewContainer>
