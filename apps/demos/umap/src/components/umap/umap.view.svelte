<svelte:options accessors />

<script>
  import { ScatterGL } from 'scatter-gl';
  import { onMount } from 'svelte';
  import { ViewContainer } from '@marcellejs/design-system';

  export let title;
  export let embedding;
  export let labels;

  let scatterContainer;
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
    embedding.subscribe((points) => {
      if (points.length > 0) {
        const dataset = new ScatterGL.Dataset(points);
        scatterGL.render(dataset);
      }
    });
  });
</script>

<ViewContainer {title}>
  <div id="scatter-container" bind:this={scatterContainer} />
</ViewContainer>

<style>
  #scatter-container {
    height: 400px;
  }
</style>
