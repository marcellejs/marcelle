<script lang="ts">
  import { getLogStream, LogLevel } from '../../core/logger';

  export let author: string;

  const logStream = getLogStream();

</script>

<footer
  class="bg-white text-gray-600 border-t px-5 py-1 flex items-center justify-between flex-col sm:flex-row"
>
  <p
    class="console"
    class:error={$logStream && $logStream[0] === LogLevel.Error}
    class:warning={$logStream && $logStream[0] === LogLevel.Warning}
  >
    {#if $logStream}
      {#if $logStream[0] === LogLevel.Warning}
        Warn:
        {$logStream[1] || ''}
      {:else if $logStream[0] === LogLevel.Error}
        Err:
        {$logStream[1] || ''}
      {:else}{$logStream[1] || ''}{/if}
    {:else}&nbsp;{/if}
  </p>
  <p class="text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-gray-200">
    © 2021 {author}
  </p>
</footer>

<style lang="postcss">
  .console {
    @apply text-xs text-gray-600 relative pl-3;
  }

  .console.warning {
    @apply text-yellow-600;
  }

  .console.error {
    @apply text-red-700;
  }

  .console::before {
    left: 0;
    position: absolute;
    content: '>';
  }

</style>
