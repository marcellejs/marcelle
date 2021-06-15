<svelte:options accessors />

<script lang="ts">
  import { ScatterGL } from 'scatter-gl';
  import { onMount } from 'svelte';
  import ViewContainer from '../../core/ViewContainer.svelte';
  import { Stream } from '../../core/stream';

  export let title: string;
  export let embedding: Stream<number[][]>;
  export let labels: Stream<number[]>;

  let scatterContainer: HTMLElement;
  let scatterGL: ScatterGL;

  onMount(() => {
    // scatter GL object
    const containerElement = document.getElementById('scatter-container');
    scatterGL = new ScatterGL(containerElement, {
      styles: {
        point: { scaleDefault: 1.6, scaleSelected: 2, scaleHover: 2 },
      },
    });
    // behavior when data are changing
    embedding.subscribe((points) => {
      if (points.length > 0) {
        let labs: number[] = [];
        if (labels === undefined || labels.value.length === 0) {
          labs = new Array(points.length).fill(0);
        } else {
          labs = labels.value;
        }

        const dataset = new ScatterGL.Dataset(points as [number, number][]);
        scatterGL.render(dataset);

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
      }
    });
    // behavior when labels are changing
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
