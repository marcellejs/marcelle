<script lang="ts">
  import type { BatchPrediction } from '@marcellejs/core';
  import { map } from 'rxjs';
  import ViewContainer from './ViewContainer.svelte';

  interface Props {
    prediction: BatchPrediction;
  }

  let { prediction }: Props = $props();

  let count = $derived(prediction.$status.pipe(map((x) => x.count || 0)));

  function clearPredictions() {
    prediction.clear();
  }
</script>

<ViewContainer title={prediction.title}>
  <p class="mly:pb-2">
    {#if $count}
      This batch prediction component contains
      {$count}
      prediction{$count ? 's' : ''}
    {:else}This batch prediction component is empty{/if}
  </p>
  <div class="mly:flex">
    <button class="mly:btn mly:btn-outline mly:btn-error" onclick={clearPredictions}>
      Clear Predictions
    </button>
  </div>
</ViewContainer>
