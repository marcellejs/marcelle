<script lang="ts">
  import type { PoseDetectionModel } from './pose-detection.component';
  import type { Observable } from 'rxjs';
  import { ViewContainer } from '@marcellejs/design-system';

  export let title: string;
  export let loading: Observable<boolean>;
  export let model: PoseDetectionModel;
</script>

<ViewContainer {title} loading={$loading}>
  <p class="p-2 text-sm text-gray-600">
    {#if $loading}&nbsp;{:else}Using {model} pose detector.{/if}
  </p>
</ViewContainer>
