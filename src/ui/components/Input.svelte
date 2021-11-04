<script lang="ts">
  export let placeholder = '';
  export let disabled = false;
  export let type: 'text' | 'email' | 'password' = 'text';
  export let value: string = null;

  function handleInput(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    value = e.currentTarget.value;
  }
</script>

<input class="marcelle" {disabled} {type} {placeholder} {value} on:input={handleInput} />

<style lang="postcss">
  input {
    @apply w-full px-4 py-2 rounded mr-1 mb-1 bg-white text-gray-600 border border-solid border-gray-300;
    transition: all 0.15s ease;
  }

  input::placeholder {
    @apply text-gray-300;
  }

  input:hover {
    @apply border-gray-400;
  }

  input:focus {
    @apply outline-none ring-blue-400 ring-2 ring-opacity-50;
  }

  input:active {
    @apply ring-blue-400 ring-4 ring-opacity-50;
  }

  input:invalid {
    @apply border-red-500 text-red-600;
  }

  input:invalid:focus {
    @apply ring-red-300;
  }
</style>
