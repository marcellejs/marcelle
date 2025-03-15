<script lang="ts">
  import type { ProgressType } from './progress-bar.component';
  import { Observable } from 'rxjs';

  interface Props {
    progress: Observable<ProgressType>;
  }

  let { progress }: Props = $props();
</script>

<div class="mgui:relative mgui:w-full mgui:pt-6" style="min-width: 250px;">
  <div class="mgui:mb-2 mgui:flex mgui:items-center mgui:justify-between">
    <div>
      <span
        class="mgui:inline-block mgui:rounded-full mgui:bg-blue-200 mgui:px-2 mgui:py-1 mgui:text-xs mgui:font-semibold mgui:uppercase mgui:text-accent"
        class:gray={$progress?.type === 'idle'}
        class:green={$progress?.type === 'success'}
        class:red={$progress?.type === 'danger'}
      >
        {$progress?.message}
      </span>
    </div>
    <div class="mgui:text-right">
      <span
        class="mgui:inline-block mgui:text-xs mgui:font-semibold mgui:text-blue-600"
        class:tgray={$progress?.type === 'idle'}
        class:tgreen={$progress?.type === 'success'}
        class:tred={$progress?.type === 'danger'}
      >
        {Math.floor($progress?.progress * 100)}%
      </span>
    </div>
  </div>
  <progress
    class="mgui:progress mgui:w-full"
    value={$progress?.progress}
    max="1"
    class:mgui:progress-accent={$progress?.type === 'default'}
    class:mgui:progress-error={$progress?.type === 'danger'}
    class:mgui:progress-success={$progress?.type === 'success'}
  ></progress>
</div>

<style lang="postcss">
  @reference "../../styles.css";

  .tgray {
    @apply mgui:text-gray-600;
  }
  .tgreen {
    @apply mgui:text-green-600;
  }
  .tred {
    @apply mgui:text-red-600;
  }

  .gray {
    @apply mgui:bg-gray-200 mgui:text-gray-600;
  }

  .green {
    @apply mgui:bg-green-200 mgui:text-green-600;
  }

  .red {
    @apply mgui:bg-red-200 mgui:text-red-600;
  }
</style>
