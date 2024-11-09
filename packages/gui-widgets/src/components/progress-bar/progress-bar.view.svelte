<script lang="ts">
  import type { ProgressType } from './progress-bar.component';
  import { Observable } from 'rxjs';

  interface Props {
    progress: Observable<ProgressType>;
  }

  let { progress }: Props = $props();
</script>

<div class="relative w-full pt-6" style="min-width: 250px;">
  <div class="mb-2 flex items-center justify-between">
    <div>
      <span
        class="inline-block rounded-full bg-blue-200 px-2 py-1 text-xs font-semibold uppercase
          text-accent"
        class:gray={$progress?.type === 'idle'}
        class:green={$progress?.type === 'success'}
        class:red={$progress?.type === 'danger'}
      >
        {$progress?.message}
      </span>
    </div>
    <div class="text-right">
      <span
        class="inline-block text-xs font-semibold text-blue-600"
        class:tgray={$progress?.type === 'idle'}
        class:tgreen={$progress?.type === 'success'}
        class:tred={$progress?.type === 'danger'}
      >
        {Math.floor($progress?.progress * 100)}%
      </span>
    </div>
  </div>
  <progress
    class="mgui-progress w-full"
    value={$progress?.progress}
    max="1"
    class:mgui-progress-accent={$progress?.type === 'default'}
    class:mgui-progress-error={$progress?.type === 'danger'}
    class:mgui-progress-success={$progress?.type === 'success'}
  ></progress>
</div>

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
