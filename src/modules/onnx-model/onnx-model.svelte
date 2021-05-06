<script lang="ts">
  import type { Stream } from '../../core';
  import type { OnnxModel } from './onnx-model.module';
  import ModuleBase from '../../core/ModuleBase.svelte';

  export let title: string;
  export let loading: Stream<boolean>;
  export let ready: Stream<boolean>;
  export let parent: OnnxModel;
</script>

<ModuleBase {title} loading={$loading}>
  <div class="p-2 text-sm text-gray-600">
    {#if $loading}
      <p>Loading Model...</p>
    {:else if $ready}
      <p>Loaded model: {parent.modelName} !</p>
    {:else}
      <p>No model loaded</p>
    {/if}
  </div>
</ModuleBase>
