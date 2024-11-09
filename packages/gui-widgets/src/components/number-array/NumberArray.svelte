<script lang="ts">
  interface Props {
    disabled?: boolean;
    value: number[];
  }

  let { disabled = false, value = $bindable() }: Props = $props();

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
      <div class="mgui-join">
        <button {disabled} class="mgui-btn mgui-btn-sm mgui-join-item" onclick={() => decrement(i)}
          >-</button
        >
        <div>
          <input
            class="mgui-join-item mgui-input mgui-input-sm mgui-input-bordered w-20"
            type="number"
            inputmode="decimal"
            {disabled}
            value={v}
            onchange={(e) => changeValue(e, i)}
          />
        </div>
        <button {disabled} class="mgui-btn mgui-btn-sm mgui-join-item" onclick={() => increment(i)}
          >+</button
        >
      </div>
    {/each}
    <div class="mgui-join">
      <button onclick={() => reduce()} {disabled} class="mgui-btn mgui-btn-sm mgui-join-item"
        >-</button
      >
      <button onclick={() => extend()} {disabled} class="mgui-btn mgui-btn-sm mgui-join-item"
        >+</button
      >
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
