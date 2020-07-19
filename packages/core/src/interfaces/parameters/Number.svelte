<script>
  export let value;

  function changeValue(e) {
    const x = parseInt(e.target.value, 10);
    if (!Number.isNaN(x)) {
      value.set(x);
    } else {
      e.target.value = value.value;
    }
  }
</script>

<svelte:options accessors />

<div class="flex">
  <button
    on:click={value.set(value.value - 1)}
    class="py-1 px-2 m-0 rounded-r-none bg-gray-200 border-gray-500 text-gray-700 font-normal">
    -
  </button>
  <input
    type="text"
    value={$value}
    on:change={changeValue}
    class="text-sm text-gray-800 text-center border-t border-b border-solid border-gray-500"
    style="width: 80px" />
  <button
    on:click={value.set(value.value + 1)}
    class="py-1 px-2 m-0 rounded-l-none bg-gray-200 border-gray-500 text-gray-700 font-normal">
    +
  </button>
</div>
