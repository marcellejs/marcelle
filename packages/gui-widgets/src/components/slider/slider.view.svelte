<script lang="ts">
  import type { BehaviorSubject } from 'rxjs';
  import RangeSlider from 'svelte-range-slider-pips';

  interface Props {
    values: BehaviorSubject<number[]>;
    min: BehaviorSubject<number>;
    max: BehaviorSubject<number>;
    step: BehaviorSubject<number>;
    range: boolean | 'min' | 'max';
    float: boolean;
    vertical: boolean;
    pips: boolean;
    pipstep: number;
    formatter: (x: number) => unknown;
    continuous: boolean;
  }

  let {
    values,
    min,
    max,
    step,
    range,
    float,
    vertical,
    pips,
    pipstep,
    formatter,
    continuous,
  }: Props = $props();

  function dispatchValues({ detail }: CustomEvent) {
    values.next(detail.values);
  }
</script>

{#if continuous}
  <RangeSlider
    bind:values={$values}
    min={$min}
    max={$max}
    step={$step}
    {range}
    {float}
    {vertical}
    {pips}
    {pipstep}
    {formatter}
    all="label"
    springValues={{ stiffness: 0.2, damping: 0.8 }}
  />
{:else}
  <RangeSlider
    values={$values}
    on:stop={dispatchValues}
    min={$min}
    max={$max}
    step={$step}
    {range}
    {float}
    {vertical}
    {pips}
    {pipstep}
    {formatter}
    all="label"
    springValues={{ stiffness: 0.2, damping: 0.8 }}
  />
{/if}

<style lang="postcss">
  @reference "../../styles.css";

  :global(.rangeSlider > .rangeBar),
  :global(.rangeSlider > .rangeHandle > .rangeNub),
  :global(.rangeSlider > .rangeHandle > .rangeFloat) {
    @apply mgui:bg-teal-500;
  }
  :global(.rangeSlider.focus > .rangeBar),
  :global(.rangeSlider > .rangeHandle.active > .rangeNub),
  :global(.rangeSlider > .rangeHandle.active > .rangeFloat) {
    @apply mgui:bg-teal-400;
  }
</style>
