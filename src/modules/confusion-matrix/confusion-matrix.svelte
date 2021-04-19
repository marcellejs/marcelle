<script>
  import { Chart, CategoryScale, Title, Tooltip } from 'chart.js';
  import { MatrixElement, MatrixController } from 'chartjs-chart-matrix';
  import { onDestroy } from 'svelte';
  import ModuleBase from '../../core/ModuleBase.svelte';

  export let title;
  export let accuracy;
  export let confusion;
  export let labels;

  Chart.register(CategoryScale, Title, Tooltip, MatrixElement, MatrixController);

  let maxCount = 1;
  let nLabels = 1;

  const defaultOptions = {
    type: 'matrix',
    data: {
      datasets: [
        {
          label: 'Confusion Matrix',
          data: [],
          backgroundColor(context) {
            if (context.dataset.data.length > 0) {
              const value = context.dataset.data[context.dataIndex].v;
              return `rgba(54, 162, 235, ${value / maxCount})`;
            }
            return 'rgba(54, 162, 235, 0)';
          },
          width(context) {
            const a = context.chart.chartArea;
            if (!a) {
              return 0;
            }
            return (a.right - a.left) / nLabels - 2;
          },
          height(context) {
            const a = context.chart.chartArea;
            if (!a) {
              return 0;
            }
            return (a.bottom - a.top) / nLabels - 2;
          },
        },
      ],
    },
    options: {
      aspectRatio: 1,
      legend: {
        display: false,
      },
      tooltips: {
        callbacks: {
          title() {
            return '';
          },
          label(context) {
            const v = context.dataset.data[context.dataIndex];
            return ['true label: ' + v.y, 'predicted label: ' + v.x, 'count: ' + v.v];
          },
        },
      },
      scales: {
        x: {
          type: 'category',
          labels: [],
          ticks: {
            display: true,
          },
          gridLines: {
            display: false,
          },
          scaleLabel: { display: true, labelString: 'Predicted Label' },
        },
        y: {
          type: 'category',
          labels: [],
          offset: true,
          reverse: true,
          ticks: {
            display: true,
          },
          gridLines: {
            display: false,
          },
          scaleLabel: { display: true, labelString: 'True Label' },
        },
      },
    },
  };

  let chart;
  let unSub = [];
  function setup(canvasElement) {
    const ctx = canvasElement.getContext('2d');
    chart = new Chart(ctx, defaultOptions);
    unSub.push(
      labels.subscribe((labs) => {
        nLabels = labs.length;
        defaultOptions.options.scales.x.labels = labs;
        defaultOptions.options.scales.y.labels = labs;
        chart.update();
      }),
    );
    unSub.push(
      confusion.subscribe((conf) => {
        maxCount = conf.reduce((m, { v }) => Math.max(m, v), 0);
        defaultOptions.data.datasets[0].data = conf;
        chart.update();
      }),
    );
  }

  onDestroy(() => {
    for (const f of unSub) {
      f();
    }
  });
</script>

<ModuleBase {title}>
  {#if $accuracy !== undefined}
    <p class="m-2">Global Accuracy: {$accuracy.toFixed(2)}</p>
    <div class="confusion-container"><canvas use:setup /></div>
  {:else}
    <p class="m-2">Waiting for predictions...</p>
  {/if}
</ModuleBase>

<style>
  .confusion-container {
    width: 350px;
    max-width: 100%;
    height: 350px;
  }
</style>
