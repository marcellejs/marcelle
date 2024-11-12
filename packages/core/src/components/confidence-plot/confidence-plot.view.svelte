<script lang="ts">
  import type { Observable } from 'rxjs';
  import type { GenericChart } from '../generic-chart';
  import { onMount } from 'svelte';
  import type { ClassifierResults } from '../../core';

  interface Props {
    predictionStream: Observable<ClassifierResults>;
    plotConfidences: GenericChart;
  }

  let { predictionStream, plotConfidences }: Props = $props();

  let confElt: HTMLDivElement = $state();

  onMount(() => {
    plotConfidences.mount(confElt);
  });
</script>

<div>
  <p>
    Predicted Label: <code style="font-size: 1.5rem;"
      >{$predictionStream ? $predictionStream?.label : ''}</code
    >
  </p>
</div>
<div bind:this={confElt}></div>
