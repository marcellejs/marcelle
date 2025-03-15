<script lang="ts">
  import { getLogStream, LogLevel } from '@marcellejs/core';

  interface Props {
    author: string;
  }

  let { author }: Props = $props();

  const logStream = getLogStream();
</script>

<footer
  class="mly:bg-white mly:text-gray-600 mly:border-t mly:px-5 mly:py-1 mly:flex mly:items-center mly:justify-between mly:flex-col mly:sm:flex-row"
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
  <p class="mly:text-sm mly:text-gray-500 mly:sm:ml-4 mly:sm:pl-4 mly:sm:border-gray-200">
    © 2021 {author}
  </p>
</footer>

<style lang="postcss">
  @reference "../styles.css";

  .console {
    @apply mly:text-xs mly:text-gray-600 mly:relative mly:pl-3;
  }

  .console.warning {
    @apply mly:text-yellow-600;
  }

  .console.error {
    @apply mly:text-red-700;
  }

  .console::before {
    left: 0;
    position: absolute;
    content: '>';
  }
</style>
