<script lang="ts">
  import {
    Chart,
    ArcElement,
    BarController,
    BubbleController,
    CategoryScale,
    DoughnutController,
    Filler,
    Legend,
    LineElement,
    LineController,
    LinearScale,
    LogarithmicScale,
    PieController,
    PointElement,
    PolarAreaController,
    RadarController,
    RadialLinearScale,
    BarElement,
    ScatterController,
    TimeScale,
    TimeSeriesScale,
    Title,
    Tooltip,
  } from 'chart.js';
  import 'chartjs-adapter-luxon';
  import type { ChartOptions as ChartJsOptions, ChartConfiguration } from 'chart.js';
  import { onDestroy, onMount, tick } from 'svelte';
  import { mergeDeep } from '../../utils/object';
  import { ViewContainer } from '@marcellejs/design-system';
  import type { ChartDataset, ChartPoint } from './generic-chart.component';
  import { Subscription } from 'rxjs';

  export let title: string;
  export let preset: { global: Record<string, unknown>; datasets?: Record<string, unknown> };
  export let options: ChartJsOptions & { xlabel?: string; ylabel?: string };
  export let datasets: ChartDataset[];

  // Note: typings are very dirty here...

  Chart.register(
    ArcElement,
    BarController,
    BubbleController,
    CategoryScale,
    DoughnutController,
    Filler,
    Legend,
    LineElement,
    LineController,
    LinearScale,
    LogarithmicScale,
    PieController,
    PointElement,
    PolarAreaController,
    RadarController,
    RadialLinearScale,
    BarElement,
    ScatterController,
    TimeScale,
    TimeSeriesScale,
    Title,
    Tooltip,
  );

  const defaultColors = [
    'rgb(54, 162, 235)',
    'rgb(255, 99, 132)',
    'rgb(255, 206, 86)',
    'rgb(75, 192, 192)',
    'rgb(153, 102, 255)',
    'rgb(255, 159, 64)',
  ];

  const defaultOptions = {
    data: {},
    options: {
      maintainAspectRatio: false,
      animation: { duration: 200 },
      borderWidth: 4,
    },
  };

  function defaultDatasetOptions(index: number) {
    return {
      borderColor: defaultColors[index % 6],
      backgroundColor: defaultColors[index % 6],
      fill: false,
      lineTension: 0.2,
    };
  }

  function transformDatasets(
    ds: ChartDataset[],
    opts: Record<string, unknown>,
    globalOptions: Partial<ChartConfiguration>,
  ) {
    const data: { labels: string[]; datasets?: unknown[] } = { labels: [] };
    let maxElts = 0;
    data.datasets = ds.map(({ dataStream, label, options: localOptions }, i) => {
      maxElts = Math.max(maxElts, dataStream.getValue() ? dataStream.getValue().length : 0);
      if (i === 0) {
        data.labels = localOptions.labels || [];
        if (!localOptions.labels && dataStream.getValue() && dataStream.getValue().length > 0) {
          if (typeof dataStream.getValue()[0] === 'number') {
            data.labels = Array.from(Array(dataStream.getValue().length), (_, j) => j.toString());
          } else {
            data.labels = (
              dataStream.getValue() as Array<{
                x: unknown;
                y: unknown;
              }>
            ).map((o: { x: unknown }) => o.x.toString());
          }
        }
      }
      let o: Record<string, unknown> = {
        ...defaultDatasetOptions(i),
        ...opts,
        ...localOptions,
        label: label,
        data: dataStream.getValue() || [],
      };
      if (
        (['bar', 'bar-fast'].includes(localOptions.type) ||
          (['bar', 'bar-fast'].includes(globalOptions.type) && !localOptions.type)) &&
        ds.length === 1
      ) {
        o.borderColor = defaultColors;
        o.backgroundColor = defaultColors;
      }
      return o;
    });
    return data;
  }

  let chart: Chart;
  let subs: Subscription[];
  let canvasElement: HTMLCanvasElement;

  function setup() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let chartOptions: Partial<ChartConfiguration> = mergeDeep(defaultOptions, preset.global) as any;
    chartOptions = mergeDeep(chartOptions, {
      data: transformDatasets(datasets, preset.datasets, chartOptions),
      options,
    });
    if (options.xlabel) {
      chartOptions = mergeDeep(chartOptions, {
        options: { scales: { x: { title: { display: true, text: options.xlabel } } } },
      });
    }
    if (options.ylabel) {
      chartOptions = mergeDeep(chartOptions, {
        options: { scales: { y: { title: { display: true, text: options.ylabel } } } },
      });
    }

    const pointsPerSeries = datasets.map(({ dataStream }) => dataStream.getValue()?.length || 0);
    subs = datasets.map(({ dataStream, options: localOptions }, i) =>
      dataStream.subscribe((values: Array<ChartPoint>) => {
        if (values && chart) {
          const prevMaxPoint = pointsPerSeries.reduce((m, x) => Math.max(m, x));
          pointsPerSeries[i] = values.length;
          if (!localOptions.labels && values.length > 0 && pointsPerSeries[i] > prevMaxPoint) {
            if (typeof values[0] === 'number') {
              chartOptions.data.labels = Array.from(Array(values.length), (_, j) => j.toString());
            } else {
              chartOptions.data.labels = (
                values as Array<{
                  x: unknown;
                  y: unknown;
                }>
              ).map((o: { x: unknown }) => o.x.toString());
            }
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          chartOptions.data.datasets[i].data = values as any;
          try {
            chart.update();
          } catch (error) {
            // eslint-disable-next-line no-console
            console.log(error);
          }
        }
      }),
    );

    const ctx = canvasElement.getContext('2d');
    chart = new Chart(ctx, chartOptions as ChartConfiguration);
  }

  function destroy() {
    for (const s of subs) {
      s.unsubscribe();
    }
    chart?.destroy();
  }

  onMount(async () => {
    await tick();
    await tick();
    setup();
  });

  let numDatasets = datasets.length;
  $: {
    if (datasets.length !== numDatasets) {
      destroy();
      setup();
      numDatasets = datasets.length;
    }
  }

  onDestroy(destroy);
</script>

<ViewContainer {title}>
  <div class="w-full h-96"><canvas bind:this={canvasElement} /></div>
</ViewContainer>
