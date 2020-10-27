<script>
  import {
    Chart,
    Arc,
    BarController,
    BubbleController,
    CategoryScale,
    DoughnutController,
    Filler,
    Legend,
    Line,
    LineController,
    LinearScale,
    LogarithmicScale,
    PieController,
    Point,
    PolarAreaController,
    RadarController,
    RadialLinearScale,
    Rectangle,
    ScatterController,
    TimeScale,
    TimeSeriesScale,
    Title,
    Tooltip,
  } from 'chart.js';
  import { onDestroy } from 'svelte';
  import { mergeDeep } from '../../utils/object.ts';
  import ModuleBase from '../../core/ModuleBase.svelte';

  export let title;
  export let preset;
  export let options;
  export let datasets;

  Chart.register(
    Arc,
    BarController,
    BubbleController,
    CategoryScale,
    DoughnutController,
    Filler,
    Legend,
    Line,
    LineController,
    LinearScale,
    LogarithmicScale,
    PieController,
    Point,
    PolarAreaController,
    RadarController,
    RadialLinearScale,
    Rectangle,
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
      animation: { duration: 200 },
      borderWidth: 4,
    },
  };

  function defaultDatasetOptions(index) {
    return {
      borderColor: defaultColors[index % 6],
      backgroundColor: defaultColors[index % 6],
      fill: false,
      lineTension: 0.2,
    };
  }

  function transformDatasets(datasets, opts, globalOptions) {
    const data = { labels: [] };
    let maxElts = 0;
    data.datasets = datasets.map(({ dataStream, label, options }, i) => {
      maxElts = Math.max(maxElts, dataStream.value ? dataStream.value.length : 0);
      if (i === 0) {
        data.labels = options.labels || [];
        if (!options.labels && dataStream.value) {
          if (dataStream.value.length > 0 && typeof dataStream.value[0] === 'number') {
            data.labels = Array.from(Array(dataStream.value.length), (_, i) => i);
          } else {
            data.labels = dataStream.value.map((o) => o.x);
          }
        }
      }
      let o = {
        ...defaultDatasetOptions(i),
        ...opts,
        ...options,
        label: label,
        data: dataStream.value || [],
      };
      if (
        (options.type === 'bar' || (globalOptions.type === 'bar' && !!options.type)) &&
        datasets.length === 1
      ) {
        o.borderColor = defaultColors;
        o.backgroundColor = defaultColors;
      }
      return o;
    });
    return data;
  }

  let chart;
  let unSub = [];

  onDestroy(() => {
    unSub.forEach((f) => f());
  });

  function setup(canvasElement) {
    // const t0 = performance.now();
    let chartOptions = mergeDeep(defaultOptions, preset.global);
    chartOptions = mergeDeep(chartOptions, {
      data: transformDatasets(datasets, preset.datasets, chartOptions),
      options,
    });
    if (options.xlabel) {
      chartOptions = mergeDeep(chartOptions, {
        options: { scales: { x: { scaleLabel: { display: true, labelString: options.xlabel } } } },
      });
    }
    if (options.ylabel) {
      chartOptions = mergeDeep(chartOptions, {
        options: { scales: { y: { scaleLabel: { display: true, labelString: options.ylabel } } } },
      });
    }
    let prevNumLabels = chartOptions.data.labels.length;
    unSub = datasets.map(({ dataStream, options }, i) =>
      dataStream.subscribe((values) => {
        if (values && chart) {
          if (!options.labels && i === 0 && values.length !== prevNumLabels) {
            if (values.length > 0 && typeof values[0] === 'number') {
              chartOptions.data.labels = Array.from(Array(values.length), (_, i) => i);
            } else {
              chartOptions.data.labels = values.map((o) => o.x);
            }
            prevNumLabels = chartOptions.data.labels.length;
          }
          chartOptions.data.datasets[i].data = values;
          chart.update();
        }
      }),
    );

    const ctx = canvasElement.getContext('2d');
    chart = new Chart(ctx, chartOptions);
  }
</script>

<ModuleBase {title}>
  <div class="w-full"><canvas use:setup /></div>
</ModuleBase>
