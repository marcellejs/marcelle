<script>
  import ViewContainer from '../../core/ViewContainer.svelte';
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

<ViewContainer {title}>
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
