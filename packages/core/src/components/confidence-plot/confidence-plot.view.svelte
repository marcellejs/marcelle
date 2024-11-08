<script lang="ts">
  import type { Observable } from 'rxjs';
  import type { GenericChart } from '../generic-chart';
  import { onMount } from 'svelte';
  import type { ClassifierResults } from '../../core';

  export let predictionStream: Observable<ClassifierResults>;
  export let plotConfidences: GenericChart;

  let confElt: HTMLDivElement;

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
