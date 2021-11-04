<script lang="ts">
  import type { Stream } from '../../core/stream';

  export let disabled = false;
  export let stream: Stream<number[]>;

  function changeValue(e: Event, i: number) {
    const target = e.target as HTMLInputElement;
    const x = parseFloat(target.value);
    if (!Number.isNaN(x)) {
      const v = stream.value.slice();
      v[i] = x;
      stream.set(v);
    } else {
      target.value = stream.value[i].toString();
    }
  }

  function decrement(i: number) {
    const v = stream.value.slice();
    v[i] -= 1;
    stream.set(v);
  }

  function increment(i: number) {
    const v = stream.value.slice();
    v[i] += 1;
    stream.set(v);
  }

  function extend() {
    const v = stream.value.slice();
    v.push(v.length ? v[v.length - 1] : 0);
    stream.set(v);
  }

  function reduce() {
    stream.set(stream.value.slice(0, stream.value.length - 1));
  }
</script>

{#if $stream}
  <div class="flex items-center">
    {#each $stream as value, i}
      <div class="flex mr-2">
        <button {disabled} on:click={() => decrement(i)} class="left"> - </button>
        <input
          type="text"
          inputmode="decimal"
          value={$stream[i]}
          on:change={(e) => changeValue(e, i)}
          {disabled}
          style="width: 80px"
        />
        <button {disabled} on:click={() => increment(i)} class="right"> + </button>
      </div>
    {/each}
    <button on:click={() => reduce()} {disabled} class="left"> - </button>
    <button on:click={() => extend()} {disabled} class="right" style="border-left: none;">
      +
    </button>
  </div>
{/if}

<style lang="postcss">
  input {
    @apply bg-white text-sm text-gray-800 text-center border-solid border-0 border-t border-b border-gray-300;
    transition: all 0.15s ease;
  }

  input::placeholder {
    @apply text-gray-300;
  }

  input:hover {
    @apply border-gray-300;
  }

  input:focus {
    @apply outline-none ring-blue-400 ring-2 ring-opacity-50;
  }

  input:active {
    @apply ring-blue-400 ring-4 ring-opacity-50;
  }

  input:disabled,
  input[disabled],
  input:hover[disabled] {
    @apply bg-white text-gray-300 border-gray-300 cursor-not-allowed ring-0;
  }

  button {
    @apply bg-transparent border-solid border uppercase text-xs rounded outline-none py-1 px-2 m-0
    bg-gray-50 border-gray-300 text-gray-700 font-normal
      cursor-pointer;
    transition: all 0.15s ease;
  }

  button:hover {
    @apply bg-blue-50 text-blue-500 border-blue-500;
  }

  button:focus {
    @apply outline-none ring-blue-400 ring-2 ring-opacity-50;
  }

  button.left {
    @apply rounded-r-none;
  }

  button.right {
    @apply rounded-l-none;
  }

  button:disabled,
  button[disabled],
  button:hover[disabled] {
    @apply bg-white text-gray-300 border-gray-300 cursor-not-allowed ring-0;
  }
</style>
