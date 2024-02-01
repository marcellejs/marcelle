<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  export function quit(): void {
    dispatch('quit');
  }
</script>

<div
  class="absolute min-h-screen top-0 inset-x-0 p-4 pb-4 z-20 sm:flex sm:items-center sm:justify-center"
>
  <div class="absolute min-h-screen inset-0 transition-opacity">
    <div
      on:click={quit}
      class="absolute inset-0 bg-gray-500 opacity-50"
      on:keypress|preventDefault={(e) => e.key === 'Escape' && quit()}
    />
  </div>
  <div class="bg-white rounded-lg shadow-xl transform transition-all sm:max-w-3xl sm:w-full">
    <slot />
  </div>
</div>
