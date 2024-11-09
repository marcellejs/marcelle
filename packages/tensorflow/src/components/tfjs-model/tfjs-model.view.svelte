<script lang="ts">
  import type { BehaviorSubject } from 'rxjs';
  import type { TrainingStatus } from '../../core';

  interface Props {
    training: BehaviorSubject<TrainingStatus>;
  }

  let { training }: Props = $props();

  let status = $derived($training.status);
  let source = $derived(!$training.data?.source
    ? 'unknown source'
    : $training.data.source === 'datastore'
      ? `datastore at ${$training.data?.url}`
      : $training.data.source === 'url'
        ? `url ${$training.data?.url}`
        : 'files');
</script>

<div class="p-2 text-sm text-gray-600">
  {#if status === 'loading'}
    <p>Loading Model...</p>
  {:else if status === 'loaded'}
    <p>Model Loaded from {source}.</p>
  {:else}
    <p>No model loaded</p>
  {/if}
</div>
