<script lang="ts">
  export let progress: number;
  export let type: 'default' | 'idle' | 'success' | 'danger' = 'default';
  export let thin = false;
</script>

<div
  class="progress-line"
  style={progress >= 0 ? `--bar-mr: ${100 - Math.floor(progress * 100)}%;` : '--bar-mr: 0px'}
  class:thin
  class:indeterminate={progress === undefined || progress === null || progress < 0}
  class:gray={type === 'idle'}
  class:green={type === 'success'}
  class:red={type === 'danger'}
/>

<style>
  .progress-line,
  .progress-line:before {
    @apply overflow-hidden h-2 mb-4 text-xs w-full rounded;
  }

  .progress-line.thin,
  .progress-line.thin:before {
    @apply h-1 mb-2;
  }

  .progress-line {
    @apply bg-blue-200 flex;
  }

  .progress-line:before {
    @apply shadow-none bg-blue-500;
    content: '';
    margin-left: 0;
    margin-right: var(--bar-mr);
  }

  .gray {
    @apply bg-gray-200 text-gray-600;
  }
  .progress-line.gray:before {
    @apply bg-gray-500;
  }

  .green {
    @apply bg-green-200 text-green-600;
  }
  .progress-line.green:before {
    @apply bg-green-500;
  }

  .red {
    @apply bg-red-200 text-red-600;
  }
  .progress-line.red:before {
    @apply bg-red-500;
  }

  .progress-line.indeterminate:before {
    -webkit-animation: running-progress 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    animation: running-progress 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  @-webkit-keyframes running-progress {
    0% {
      margin-left: 0px;
      margin-right: 100%;
    }
    50% {
      margin-left: 25%;
      margin-right: 0%;
    }
    100% {
      margin-left: 100%;
      margin-right: 0;
    }
  }
  @keyframes running-progress {
    0% {
      margin-left: 0px;
      margin-right: 100%;
    }
    50% {
      margin-left: 25%;
      margin-right: 0%;
    }
    100% {
      margin-left: 100%;
      margin-right: 0;
    }
  }
</style>
