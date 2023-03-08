<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let variant: 'outline' | 'filled' | 'light' = 'outline';
  export let disabled = false;
  export let type: 'default' | 'success' | 'warning' | 'danger' = 'default';
  export let size: 'small' | 'medium' | 'large' = 'medium';

  export let round = false;
  export let pressed = false;

  const dispatch = createEventDispatcher();

  function startDown() {
    pressed = true;
    dispatch('pressed', pressed);
  }

  function stopDown() {
    if (pressed) {
      pressed = false;
      dispatch('pressed', pressed);
    }
  }

  function fireClick(e: Event) {
    dispatch('click', e);
  }
</script>

<svelte:body on:mouseup={stopDown} on:touchend={stopDown} />

<button
  class="marcelle"
  class:outline={variant === 'outline'}
  class:filled={variant === 'filled'}
  class:light={variant === 'light'}
  class:success={type === 'success'}
  class:warning={type === 'warning'}
  class:danger={type === 'danger'}
  class:size-small={size === 'small'}
  class:size-large={size === 'large'}
  class:round
  {disabled}
  on:click
  on:mousedown={startDown}
  on:touchstart|preventDefault={startDown}
  on:touchend={fireClick}
>
  <slot />
</button>

<style lang="postcss">
  button {
    @apply outline-none font-semibold text-xs px-4 py-2 rounded cursor-pointer;
    transition: all 0.15s ease;
  }

  button:hover {
    @apply bg-blue-100 text-blue-600;
  }

  button:focus {
    @apply outline-none ring-blue-400 ring-2 ring-opacity-50;
  }

  button:active {
    @apply ring-blue-400 ring-4 ring-opacity-50;
  }

  button.size-small {
    @apply px-2 py-1;
  }

  button.size-large {
    @apply px-6 py-3;
  }

  button.outline {
    @apply bg-white text-gray-500 border border-solid border-gray-300;
    transition: all 0.15s ease;
  }

  button.outline:hover {
    @apply bg-blue-50 text-blue-500 border-blue-500;
  }

  button.filled {
    @apply border-0 bg-blue-500 text-white;
  }

  button.filled:hover {
    @apply bg-blue-400;
  }

  button.light {
    @apply border-0 bg-blue-100 text-blue-600;
  }

  button.light:hover {
    @apply bg-blue-200;
  }

  button.success {
    @apply text-green-500 border-green-500;
  }

  button.success:hover {
    @apply bg-green-50 text-green-500 border-green-500;
  }

  button.success:focus {
    @apply ring-green-400 ring-2 ring-opacity-50;
  }

  button.success:active {
    @apply ring-4;
  }

  button.success.filled {
    @apply bg-green-500 text-white;
  }

  button.success.filled:hover {
    @apply bg-green-400;
  }

  button.success.light {
    @apply bg-green-100 text-green-600;
  }

  button.success.light:hover {
    @apply bg-green-200;
  }

  button.warning {
    @apply text-yellow-500 border-yellow-500;
  }

  button.warning:hover {
    @apply bg-yellow-50 text-yellow-500 border-yellow-500;
  }

  button.warning:focus {
    @apply ring-yellow-400 ring-2 ring-opacity-50;
  }

  button.warning:active {
    @apply ring-4;
  }

  button.warning.filled {
    @apply bg-yellow-500 text-white;
  }

  button.warning.filled:hover {
    @apply bg-yellow-400;
  }

  button.warning.light {
    @apply bg-yellow-100 text-yellow-600;
  }

  button.warning.light:hover {
    @apply bg-yellow-200;
  }

  button.danger {
    @apply text-red-500 border-red-500;
  }

  button.danger:hover {
    @apply bg-red-50 text-red-500 border-red-500;
  }

  button.danger:focus {
    @apply ring-red-400 ring-2 ring-opacity-50;
  }

  button.danger:active {
    @apply ring-4;
  }

  button.danger.filled {
    @apply bg-red-500 text-white;
  }

  button.danger.filled:hover {
    @apply bg-red-400;
  }

  button.danger.light {
    @apply bg-red-100 text-red-600;
  }

  button.danger.light:hover {
    @apply bg-red-200;
  }

  button:disabled,
  button[disabled],
  button:hover[disabled] {
    @apply bg-white text-gray-300 border-gray-300 cursor-not-allowed ring-0;
  }

  button.filled:disabled,
  button.filled[disabled],
  button.filled:hover[disabled] {
    @apply bg-gray-300 text-gray-50;
  }

  button.light:disabled,
  button.light[disabled],
  button.light:hover[disabled] {
    @apply bg-gray-200 text-gray-400;
  }

  button.round {
    @apply border-0 rounded-full w-9 h-9 p-1 flex justify-center items-center;
  }

  button.round.size-small {
    @apply w-6 h-6;
  }

  button.round.size-large {
    @apply w-12 h-12;
  }
</style>
