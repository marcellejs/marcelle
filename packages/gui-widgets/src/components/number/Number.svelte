<script lang="ts">
  export let disabled = false;
  export let value: number;

  function changeValue(e: Event) {
    const target = e.target as HTMLInputElement;
    const x = parseFloat(target.value);
    if (!Number.isNaN(x)) {
      value = x;
    } else {
      target.value = value.toString();
    }
  }
</script>

<div class="join">
  <button
    {disabled}
    class="btn btn-sm join-item"
    on:click={() => {
      value -= 1;
    }}>-</button
  >
  <div>
    <input
      class="input input-sm input-bordered join-item w-20"
      type="number"
      inputmode="decimal"
      {disabled}
      {value}
      on:change={changeValue}
    />
  </div>
  <button
    {disabled}
    class="btn btn-sm join-item"
    on:click={() => {
      value += 1;
    }}>+</button
  >
</div>

<style>
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type='number'] {
    -moz-appearance: textfield;
  }
</style>
