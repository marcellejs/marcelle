<svelte:options />

<script>
  import { ScatterGL } from 'scatter-gl';
  import { onMount } from 'svelte';
  import { auditTime } from 'rxjs';

  let { embedding, labels } = $props();

  let scatterContainer = $state();
  let scatterGL;
  onMount(() => {
    scatterGL = new ScatterGL(scatterContainer, {
      styles: {
        point: { scaleDefault: 1.6, scaleSelected: 2, scaleHover: 2 },
      },
    });
    labels.subscribe((labs) => {
      const classIndices = Array.from(new Set(labs));
      const hues = [...new Array(classIndices.length)].map((_, i) =>
        Math.floor((255 / classIndices.length) * i),
      );
      const lightTransparentColorsByLabel = hues.map((hue) => `hsla(${hue}, 100%, 50%, 0.1)`);
      const heavyTransparentColorsByLabel = hues.map((hue) => `hsla(${hue}, 100%, 50%, 0.75)`);
      const opaqueColorsByLabel = hues.map((hue) => `hsla(${hue}, 100%, 50%, 1)`);
      scatterGL.setPointColorer((index, selectedIndices, hoverIndex) => {
        if (selectedIndices.size > 0) {
          if (!selectedIndices.has(index)) {
            return lightTransparentColorsByLabel[classIndices.indexOf(labs[index])];
          }
          return opaqueColorsByLabel[classIndices.indexOf(labs[index])];
        }
        if (index === hoverIndex) {
          return opaqueColorsByLabel[classIndices.indexOf(labs[index])];
        }
        return heavyTransparentColorsByLabel[classIndices.indexOf(labs[index])];
      });
    });
    embedding.pipe(auditTime(50)).subscribe((points) => {
      if (points.length > 0) {
        const dataset = new ScatterGL.Dataset(points);
        scatterGL.render(dataset);
      }
    });
  });

  export {
  	embedding,
  	labels,
  }
</script>

<div id="scatter-container" bind:this={scatterContainer}></div>

<style>
  #scatter-container {
    height: 400px;
  }
</style>
