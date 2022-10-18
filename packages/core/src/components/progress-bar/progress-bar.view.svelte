<script lang="ts">
  import { ViewContainer } from '@marcellejs/design-system';
  import { Progress } from '@marcellejs/design-system';
  import type { Stream } from '../../core';
  import type { ProgressType } from './progress-bar.component';

  export let title: string;
  export let progress: Stream<ProgressType>;
</script>

<ViewContainer {title}>
  <div class="relative pt-6 w-full" style="min-width: 250px;">
    <div class="flex mb-2 items-center justify-between">
      <div>
        <span
          class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600
          bg-blue-200"
          class:gray={$progress?.type === 'idle'}
          class:green={$progress?.type === 'success'}
          class:red={$progress?.type === 'danger'}
        >
          {$progress?.message}
        </span>
      </div>
      <div class="text-right">
        <span
          class="text-xs font-semibold inline-block text-blue-600"
          class:tgray={$progress?.type === 'idle'}
          class:tgreen={$progress?.type === 'success'}
          class:tred={$progress?.type === 'danger'}
        >
          {Math.floor($progress?.progress * 100)}%
        </span>
      </div>
    </div>
    <Progress progress={$progress?.progress} type={$progress?.type} />
  </div>
</ViewContainer>

<style>
  .tgray {
    @apply text-gray-600;
  }
  .tgreen {
    @apply text-green-600;
  }
  .tred {
    @apply text-red-600;
  }

  .gray {
    @apply bg-gray-200 text-gray-600;
  }

  .green {
    @apply bg-green-200 text-green-600;
  }

  .red {
    @apply bg-red-200 text-red-600;
  }
</style>
