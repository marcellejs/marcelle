<script lang="ts">
  import type { Stream } from '../../core';
  import ViewContainer from '../../core/ViewContainer.svelte';
  import Input from '../../ui/components/Input.svelte';

  export let title: string;
  export let text: Stream<string>;
</script>

<ViewContainer {title}>
  <div class="w-full max-w-sm">
    <div class="md:flex md:items-center mb-2">
      <Input type="text" placeholder="Enter a label.." bind:value={$text} />
    </div>
  </div>
</ViewContainer>
