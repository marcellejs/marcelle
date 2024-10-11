<script lang="ts">
  export let disabled = false;
  export let value: number[];

  function changeValue(e: Event, i: number) {
    const target = e.target as HTMLInputElement;
    const x = parseFloat(target.value);
    if (!Number.isNaN(x)) {
      value[i] = x;
    } else {
      target.value = value[i].toString();
    }
  }

  function decrement(i: number) {
    const v = value.slice();
    v[i] -= 1;
    value = v;
  }

  function increment(i: number) {
    const v = value.slice();
    v[i] += 1;
    value = v;
  }

  function extend() {
    const v = value.slice();
    v.push(v.length ? v[v.length - 1] : 0);
    value = v;
  }

  function reduce() {
    value = value.slice(0, value.length - 1);
  }
</script>

{#if value && Array.isArray(value)}
  <div class="flex items-center gap-2">
    {#each value as v, i}
      <div class="join">
        <button {disabled} class="btn btn-sm join-item" on:click={() => decrement(i)}>-</button>
        <div>
          <input
            class="input input-sm input-bordered join-item w-20"
            type="number"
            inputmode="decimal"
            {disabled}
            value={v}
            on:change={(e) => changeValue(e, i)}
          />
        </div>
        <button {disabled} class="btn btn-sm join-item" on:click={() => increment(i)}>+</button>
      </div>
    {/each}
    <div class="join">
      <button on:click={() => reduce()} {disabled} class="btn btn-sm join-item">-</button>
      <button on:click={() => extend()} {disabled} class="btn btn-sm join-item">+</button>
    </div>
  </div>
{/if}

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
