<script lang="ts">
  import type { Stream } from '../../core';
  import ViewContainer from '../../core/ViewContainer.svelte';
  import Input from '../../ui/components/Input.svelte';

  export let title: string;
  export let value: Stream<string>;
  export let disabled: Stream<boolean>;
</script>

<ViewContainer {title}>
  <div class="w-full max-w-sm">
    <div class="md:flex md:items-center mb-2">
      <Input type="text" placeholder="Enter a label.." bind:value={$value} disabled={$disabled} />
    </div>
  </div>
</ViewContainer>
