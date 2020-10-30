<script>
  import ModuleBase from '../../core/ModuleBase.svelte';
  import RangeSlider from 'svelte-range-slider-pips';

  export let title;
  export let values;
  export let min;
  export let max;
  export let step;
  export let range;
  export let float;
  export let vertical;
  export let pips;
  export let pipstep;
  export let formatter;
</script>

<style global lang="postcss">
  .rangeSlider > .rangeBar,
  .rangeSlider > .rangeHandle > .rangeNub,
  .rangeSlider > .rangeHandle > .rangeFloat {
    @apply bg-teal-500;
  }
  .rangeSlider.focus > .rangeBar,
  .rangeSlider > .rangeHandle.active > .rangeNub,
  .rangeSlider > .rangeHandle.active > .rangeFloat {
    @apply bg-teal-400;
  }
</style>

<ModuleBase {title}>
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
    springValues={{ stiffness: 0.2, damping: 0.8 }} />
</ModuleBase>
