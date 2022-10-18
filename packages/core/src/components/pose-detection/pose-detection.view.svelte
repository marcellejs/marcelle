<script lang="ts">
  import type { Stream } from '../../core';
  import { ViewContainer } from '@marcellejs/design-system';
  import type { PoseDetectionModel } from './pose-detection.component';

  export let title: string;
  export let loading: Stream<boolean>;
  export let model: PoseDetectionModel;
</script>

<ViewContainer {title} loading={$loading}>
  <p class="p-2 text-sm text-gray-600">
    {#if $loading}&nbsp;{:else}Using {model} pose detector.{/if}
  </p>
</ViewContainer>
