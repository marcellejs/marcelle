<script lang="ts">
  import { Switch, ViewContainer } from '@marcellejs/design-system';
  import type { Stream } from '../../core';
  import BarPlot from './BarPlot.svelte';

  export let title: string;
  export let active: Stream<boolean>;
  export let acceleration: Stream<[number, number, number]>;
</script>

<ViewContainer {title}>
  <div class="mt-2 w-full flex flex-col">
    <div class="mb-4" style="margin-left: 10px;">
      <div>
        <Switch text="activate sensors" bind:checked={$active} />
      </div>
    </div>
    <BarPlot values={$acceleration} />
  </div>
</ViewContainer>

<style>
</style>
