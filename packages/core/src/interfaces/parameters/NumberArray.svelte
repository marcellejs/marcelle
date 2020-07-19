<script>
  export let values;

  function changeValue(e, i) {
    const x = parseInt(e.target.value, 10);
    if (!Number.isNaN(x)) {
      const v = values.value.slice();
      v[i] = x;
      values.set(v);
    } else {
      e.target.value = values.value[i];
    }
  }

  function decrement(i) {
    const v = values.value.slice();
    v[i] -= 1;
    values.set(v);
  }

  function increment(i) {
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
          class="py-1 px-2 m-0 rounded-r-none bg-gray-200 border-gray-500 text-gray-700 font-normal">
          -
        </button>
        <input
          type="text"
          value={$values[i]}
          on:change={e => changeValue(e, i)}
          class="text-sm text-gray-800 text-center border-t border-b border-solid border-gray-500"
          style="width: 80px" />
        <button
          on:click={() => increment(i)}
          class="py-1 px-2 m-0 rounded-l-none bg-gray-200 border-gray-500 text-gray-700 font-normal">
          +
        </button>
      </div>
    {/each}
    <button
      on:click={() => reduce()}
      class="py-1 px-2 m-0 bg-gray-200 rounded-lg rounded-r-none border-gray-500 text-gray-700
      font-normal">
      -
    </button>
    <button
      on:click={() => extend()}
      class="py-1 px-2 m-0 bg-gray-200 border-l-0 rounded-lg rounded-l-none border-gray-500
      text-gray-700 font-normal">
      +
    </button>
  </div>
{/if}
