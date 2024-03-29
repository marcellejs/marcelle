<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import { Button, ViewContainer } from '@marcellejs/design-system';
  import type { Stream } from '../../core/stream';
  import {
    Chart,
    Filler,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    ScatterController,
    Title,
    Tooltip,
    type ChartConfiguration,
  } from 'chart.js';
  import zoomPlugin from 'chartjs-plugin-zoom';
  import type { ObjectId } from '../../core';
  import { dequal } from 'dequal';

  Chart.register(
    Filler,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    ScatterController,
    Title,
    Tooltip,
  );
  Chart.register(zoomPlugin);

  export let title: string;
  export let data: Stream<ChartConfiguration['data']>;
  export let hovered: Stream<ObjectId[]>;
  export let clicked: Stream<ObjectId[]>;

  const getOrCreateTooltip = (chart: any) => {
    let tooltipEl = chart.canvas.parentNode.querySelector('div');

    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.style.background = 'transparent';
      tooltipEl.style.borderRadius = '3px';
      tooltipEl.style.color = 'white';
      tooltipEl.style.opacity = 1;
      tooltipEl.style.pointerEvents = 'none';
      tooltipEl.style.position = 'absolute';
      tooltipEl.style.transform = 'translate(-50%, 0)';
      tooltipEl.style.transition = 'all .1s ease';

      const img = document.createElement('img');
      img.style.borderRadius = '4px';
      img.style.margin = '0px';
      img.width = 100;
      img.height = 100;

      tooltipEl.appendChild(img);
      chart.canvas.parentNode.appendChild(tooltipEl);
    }

    return tooltipEl;
  };

  export function externalTooltipHandler(context: any) {
    // Tooltip Element
    const { chart, tooltip } = context;
    const tooltipEl = getOrCreateTooltip(chart);

    // Hide if no tooltip
    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = 0;
      return;
    }

    const img = tooltipEl.querySelector('img');
    img.src = tooltip.dataPoints[0].raw.thumbnail;

    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    tooltipEl.style.left = positionX + tooltip.caretX + 70 + 'px';
    tooltipEl.style.top = positionY + tooltip.caretY + 20 + 'px';
    tooltipEl.style.font = tooltip.options.bodyFont.string;
    tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
  }

  const defaultOptions: Partial<ChartConfiguration> = {
    type: 'scatter',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 200 },
      scales: {
        y: { position: 'center', ticks: { display: false } },
        x: { position: 'center', ticks: { display: false } },
      },
      elements: {
        point: {
          radius: 8,
          hoverRadius: 10,
          borderWidth: 0,
          hoverBorderWidth: 3,
        },
      },
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          enabled: false,
          position: 'nearest',
          external: externalTooltipHandler,
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
              // modifierKey: 'ctrl',
            },
            pinch: {
              enabled: true,
            },
            mode: 'xy',
          },
          pan: {
            enabled: true,
            // modifierKey: 'ctrl',
            mode: 'xy',
          },
        },
      },
      onClick(e, elts) {
        clicked.set(elts.map(({ element }) => element));
        // clicked.set(elts.map(({ element }) => element?.$context?.raw?.id));
      },
      onHover(e, elts) {
        const ids = elts.map(({ element }) => element?.$context?.raw?.id);
        if (!dequal(ids, hovered.get())) hovered.set(ids);
      },
    },
  };

  let chart: Chart;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  let unSub: () => void = () => {};
  let canvasElement: HTMLCanvasElement;

  async function setup() {
    unSub();
    const chartOptions: Partial<ChartConfiguration> = { ...defaultOptions, data: data.get() };
    unSub = data
      .filter((x) => !!x)
      .subscribe((d) => {
        chartOptions.data = d;
        chart.update();
        chart.resetZoom();
      });

    const ctx = canvasElement.getContext('2d');
    chart = new Chart(ctx, chartOptions as ChartConfiguration);
  }

  onMount(async () => {
    await tick();
    await tick();
    setup();
  });

  onDestroy(() => {
    unSub();
    chart?.destroy();
  });
</script>

<ViewContainer {title}>
  <div id="scatter-container"><canvas bind:this={canvasElement} /></div>
  <div class="flex justify-end">
    <Button size="small" on:click={() => chart.resetZoom()}>Reset Zoom</Button>
  </div>
</ViewContainer>

<style>
  #scatter-container {
    height: 600px;
  }
</style>
