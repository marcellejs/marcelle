<script lang="ts">
  import type { TrainingStatus } from '@marcellejs/core';
  import type { BehaviorSubject } from 'rxjs';

  interface Props {
    training: BehaviorSubject<TrainingStatus>;
  }

  let { training }: Props = $props();

  let status = $derived($training.status);
  let source = $derived(
    !$training.data?.source
      ? 'unknown source'
      : $training.data.source === 'datastore'
        ? `datastore at ${$training.data?.url}`
        : $training.data.source === 'url'
          ? `url ${$training.data?.url}`
          : 'files',
  );
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

<style>
  div {
    padding: 0.5rem;
    font-size: 0.875rem /* 14px */;
    line-height: 1.25rem /* 20px */;
    --tw-text-opacity: 1;
    color: rgb(75 85 99 / var(--tw-text-opacity)) /* #4b5563 */;
  }
</style>
