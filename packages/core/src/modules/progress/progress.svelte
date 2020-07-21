<script>
  import { onMount } from 'svelte';

  export let title;
  export let training;
  export let epochs = 1;

  let status = 'idle';
  let percent = 0;
  onMount(() => {
    training.subscribe(s => {
      status = s.status;
      if (status === 'start' || status === 'error') {
        percent = 0;
      } else if (status === 'success') {
        percent = 100;
      } else {
        percent = Math.floor((100 * s.epoch) / epochs);
      }
    });
  });
</script>

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
</style>

<span class="card-title">{title}</span>
<div class="relative pt-6">
  <div class="flex mb-2 items-center justify-between">
    <div>
      <span
        class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-teal-600
        bg-teal-200"
        class:gray={status === 'idle'}
        class:green={status === 'success'}
        class:red={status === 'error'}>
        Status: {status}
      </span>
    </div>
    <div class="text-right">
      <span
        class="text-xs font-semibold inline-block text-teal-600"
        class:tgray={status === 'idle'}
        class:tgreen={status === 'success'}
        class:tred={status === 'error'}>
        {percent}%
      </span>
    </div>
  </div>
  <div
    class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-teal-200"
    class:gray={status === 'idle'}
    class:green={status === 'success'}
    class:red={status === 'error'}>
    <div
      style="width:{percent}%"
      class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center
      bg-teal-500"
      class:gray={status === 'idle'}
      class:green={status === 'success'}
      class:red={status === 'error'} />
  </div>
</div>
