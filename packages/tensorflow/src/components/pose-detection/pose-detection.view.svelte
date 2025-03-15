<script lang="ts">
  import type { PoseDetectionModel } from './pose-detection.component';
  import type { Observable } from 'rxjs';

  interface Props {
    loading: Observable<boolean>;
    model: PoseDetectionModel;
  }

  let { loading, model }: Props = $props();
</script>

<p class="mtf:p-2 mtf:text-sm mtf:text-gray-600">
  {#if $loading}&nbsp;{:else}Using {model} pose detector.{/if}
</p>
