<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
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
    type TooltipModel,
  } from 'chart.js';
  import zoomPlugin from 'chartjs-plugin-zoom';
  import type { ObjectId } from '../../core';
  import { dequal } from 'dequal';
  import { BehaviorSubject, Subscription, filter } from 'rxjs';

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

  interface Props {
    data: BehaviorSubject<ChartConfiguration['data']>;
    hovered: BehaviorSubject<ObjectId[]>;
    clicked: BehaviorSubject<ObjectId[]>;
  }

  let { data, hovered, clicked }: Props = $props();

  const getOrCreateTooltip = (chart: Chart) => {
    let tooltipEl = chart.canvas.parentNode.querySelector('div');

    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.style.background = 'transparent';
      tooltipEl.style.borderRadius = '3px';
      tooltipEl.style.color = 'white';
      tooltipEl.style.opacity = '1';
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

  export function externalTooltipHandler(context: {
    chart: Chart;
    tooltip: TooltipModel<'scatter'>;
  }) {
    // Tooltip Element
    const { chart, tooltip } = context;
    const tooltipEl = getOrCreateTooltip(chart);

    // Hide if no tooltip
    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = '0';
      return;
    }

    const img = tooltipEl.querySelector('img');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    img.src = (tooltip.dataPoints[0].raw as any).thumbnail;

    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

    // Display, position, and set styles for font
    tooltipEl.style.opacity = '1';
    tooltipEl.style.left = positionX + tooltip.caretX + 70 + 'px';
    tooltipEl.style.top = positionY + tooltip.caretY + 20 + 'px';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tooltipEl.style.font = (tooltip.options.bodyFont as any).string;
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
        clicked.next(elts.map(({ element }) => element as unknown as string));
        // clicked.next(elts.map(({ element }) => element?.$context?.raw?.id));
      },
      onHover(e, elts) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ids = elts.map(({ element }) => (element as any)?.$context?.raw?.id);
        if (!dequal(ids, hovered.getValue())) hovered.next(ids);
      },
    },
  };

  let chart: Chart = $state();
  let sub: Subscription;
  let canvasElement: HTMLCanvasElement = $state();

  async function setup() {
    if (sub) sub.unsubscribe();
    const chartOptions: Partial<ChartConfiguration> = { ...defaultOptions, data: data.getValue() };
    sub = data.pipe(filter((x) => !!x && !!chart)).subscribe((d) => {
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
    if (sub) sub.unsubscribe();
    chart?.destroy();
  });
</script>

<div id="scatter-container"><canvas bind:this={canvasElement}></canvas></div>
<div class="mcl:flex mcl:justify-end">
  <button class="mcl:btn mcl:btn-sm" onclick={() => chart.resetZoom()}>Reset Zoom</button>
</div>

<style>
  #scatter-container {
    height: 600px;
  }
</style>
