<script lang="ts">
  import { onMount } from 'svelte';
  import type { Stream, TrainingStatus } from '../../core';
  import ModuleBase from '../../core/ModuleBase.svelte';

  export let title: string;
  export let training: Stream<TrainingStatus>;

  let status = 'idle';
  let percent = 0;
  onMount(() => {
    training.subscribe((s) => {
      status = s.status;
      if (status === 'start' || status === 'error') {
        percent = 0;
      } else if (status === 'success') {
        percent = 100;
      } else {
        percent = Math.floor((100 * (s.epoch + 1)) / s.epochs);
      }
    });
  });

</script>

<ModuleBase {title}>
  <div class="relative pt-6 w-full" style="min-width: 250px;">
    <div class="flex mb-2 items-center justify-between">
      <div>
        <span
          class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600
          bg-blue-200"
          class:gray={status === 'idle'}
          class:green={status === 'success' || status === 'loaded'}
          class:red={status === 'error'}
        >
          Status:
          {status}
        </span>
      </div>
      <div class="text-right">
        <span
          class="text-xs font-semibold inline-block text-blue-600"
          class:tgray={status === 'idle'}
          class:tgreen={status === 'success' || status === 'loaded'}
          class:tred={status === 'error'}
        >
          {percent}%
        </span>
      </div>
    </div>
    <div
      class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200"
      class:gray={status === 'idle'}
      class:green={status === 'success' || status === 'loaded'}
      class:red={status === 'error'}
    >
      <div
        style="width:{percent}%"
        class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center
        bg-blue-500"
        class:xgray={status === 'idle'}
        class:xgreen={status === 'success' || status === 'loaded'}
        class:xred={status === 'error'}
      />
    </div>
  </div>
</ModuleBase>

<style>
  .gray {
    @apply bg-gray-200 text-gray-600;
  }
  .green {
    @apply bg-green-200 text-green-600;
  }
  .red {
    @apply bg-red-200 text-red-600;
  }
  .tgray {
    @apply text-gray-600;
  }
  .tgreen {
    @apply text-green-600;
  }
  .tred {
    @apply text-red-600;
  }
  .xgray {
    @apply bg-gray-500;
  }
  .xgreen {
    @apply bg-green-500;
  }
  .xred {
    @apply bg-red-500;
  }

</style>
