<script lang="ts">
  import type { Stream } from '../../core/stream';
  import { ViewContainer } from '@marcellejs/design-system';
  import RangeSlider from 'svelte-range-slider-pips';

  export let title: string;
  export let values: Stream<number[]>;
  export let min: Stream<number>;
  export let max: Stream<number>;
  export let step: Stream<number>;
  export let range: boolean | 'min' | 'max';
  export let float: boolean;
  export let vertical: boolean;
  export let pips: boolean;
  export let pipstep: number;
  export let formatter: (x: unknown) => unknown;
  export let continuous: boolean;

  function dispatchValues({ detail }: CustomEvent) {
    values.set(detail.values);
  }
</script>

<ViewContainer {title}>
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
</ViewContainer>

<style lang="postcss">
  :global(.rangeSlider > .rangeBar),
  :global(.rangeSlider > .rangeHandle > .rangeNub),
  :global(.rangeSlider > .rangeHandle > .rangeFloat) {
    @apply bg-teal-500;
  }
  :global(.rangeSlider.focus > .rangeBar),
  :global(.rangeSlider > .rangeHandle.active > .rangeNub),
  :global(.rangeSlider > .rangeHandle.active > .rangeFloat) {
    @apply bg-teal-400;
  }
</style>
