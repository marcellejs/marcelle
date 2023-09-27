<script lang="ts">
  import type { BehaviorSubject } from 'rxjs';
  import type { TrainingStatus } from '../../core';
  import { ViewContainer } from '@marcellejs/design-system';

  export let title: string;
  export let training: BehaviorSubject<TrainingStatus>;

  $: status = $training.status;
  $: source = !$training.data?.source
    ? 'unknown source'
    : $training.data.source === 'datastore'
    ? `datastore at ${$training.data?.url}`
    : $training.data.source === 'url'
    ? `url ${$training.data?.url}`
    : 'files';
</script>

<ViewContainer {title} loading={status === 'loading'}>
  <div class="p-2 text-sm text-gray-600">
    {#if status === 'loading'}
      <p>Loading Model...</p>
    {:else if status === 'loaded'}
      <p>Model Loaded from {source}.</p>
    {:else}
      <p>No model loaded</p>
    {/if}
  </div>
</ViewContainer>
