<script lang="ts">
  import type { Stream } from '../../core';
  import type { OnnxModel } from './onnx-model.component';
  import ViewContainer from '../../core/ViewContainer.svelte';

  export let title: string;
  export let loading: Stream<boolean>;
  export let ready: Stream<boolean>;
  export let parent: OnnxModel;
</script>

<ViewContainer {title} loading={$loading}>
  <div class="p-2 text-sm text-gray-600">
    {#if $loading}
      <p>Loading Model...</p>
    {:else if $ready}
      <p>Loaded model: {parent.modelName} !</p>
    {:else}
      <p>No model loaded</p>
    {/if}
  </div>
</ViewContainer>
