<script lang="ts">
  import type { Stream } from '../../core';

  export let values: Stream<number[]>;

  function changeValue(e: Event, i: number) {
    const target = e.target as HTMLInputElement;
    const x = parseInt(target.value, 10);
    if (!Number.isNaN(x)) {
      const v = values.value.slice();
      v[i] = x;
      values.set(v);
    } else {
      target.value = values.value[i].toString();
    }
  }

  function decrement(i: number) {
    const v = values.value.slice();
    v[i] -= 1;
    values.set(v);
  }

  function increment(i: number) {
    const v = values.value.slice();
    v[i] += 1;
    values.set(v);
  }

  function extend() {
    const v = values.value.slice();
    v.push(v.length ? v[v.length - 1] : 0);
    values.set(v);
  }

  function reduce() {
    values.set(values.value.slice(0, values.value.length - 1));
  }
</script>

{#if $values}
  <div class="flex items-center">
    {#each $values as value, i}
      <div class="flex mr-2">
        <button
          on:click={() => decrement(i)}
          class="bg-transparent border border-solid uppercase text-xs rounded outline-none py-1 px-2
          m-0 rounded-r-none bg-gray-100 border-gray-400 text-gray-700 font-normal
          hover:border-blue-500 hover:text-blue-500">
          -
        </button>
        <input
          type="text"
          value={$values[i]}
          on:change={(e) => changeValue(e, i)}
          class="text-sm text-gray-800 text-center border-t border-b border-solid border-gray-400"
          style="width: 80px" />
        <button
          on:click={() => increment(i)}
          class="bg-transparent border border-solid uppercase text-xs rounded outline-none py-1 px-2
          m-0 rounded-l-none bg-gray-100 border-gray-400 text-gray-700 font-normal
          hover:border-blue-500 hover:text-blue-500">
          +
        </button>
      </div>
    {/each}
    <button
      on:click={() => reduce()}
      class="bg-transparent border border-solid uppercase text-xs rounded outline-none py-1 px-2 m-0
      rounded-r-none bg-gray-100 border-gray-400 text-gray-700 font-normal hover:border-blue-500
      hover:text-blue-500">
      -
    </button>
    <button
      on:click={() => extend()}
      class="bg-transparent border border-solid uppercase text-xs rounded outline-none py-1 px-2 m-0
      rounded-l-none border-l-0 bg-gray-100 border-gray-400 text-gray-700 font-normal
      hover:border-blue-500 hover:text-blue-500">
      +
    </button>
  </div>
{/if}
