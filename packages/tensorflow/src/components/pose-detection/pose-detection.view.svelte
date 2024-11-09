<script lang="ts">
  import type { PoseDetectionModel } from './pose-detection.component';
  import type { Observable } from 'rxjs';

  interface Props {
    loading: Observable<boolean>;
    model: PoseDetectionModel;
  }

  let { loading, model }: Props = $props();
</script>

<p class="p-2 text-sm text-gray-600">
  {#if $loading}&nbsp;{:else}Using {model} pose detector.{/if}
</p>
