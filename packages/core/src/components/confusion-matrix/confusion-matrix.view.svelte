<script>
  import { Chart, CategoryScale, Title, Tooltip } from 'chart.js';
  import { MatrixElement, MatrixController } from 'chartjs-chart-matrix';
  import { onDestroy } from 'svelte';
  import { ViewContainer } from '@marcellejs/design-system';

  export let title;
  export let loading;
  export let progress;
  export let accuracy;
  export let confusion;
  export let labels;
  export let selected;

  Chart.register(CategoryScale, Title, Tooltip, MatrixElement, MatrixController);

  let maxCount = 1;
  let nLabels = 1;

  let selectedDataIndex = -1;

  const defaultOptions = {
    type: 'matrix',
    data: {
      datasets: [
        {
          label: 'Confusion Matrix',
          data: [],
          backgroundColor(context) {
            if (context.dataset.data.length > 0) {
              if (context.dataIndex === selectedDataIndex) {
                const { x, y } = context.dataset.data[context.dataIndex];
                return x === y ? 'green' : 'red';
              }
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
      plugins: {
        tooltip: {
          callbacks: {
            title([context]) {
              const v = context.dataset.data[context.dataIndex];
              return ['count: ' + v.v];
            },
            label(context) {
              const v = context.dataset.data[context.dataIndex];
              return ['true label: ' + v.y, 'predicted label: ' + v.x];
            },
          },
        },
      },
      scales: {
        x: {
          type: 'category',
          labels: [],
          ticks: {
            display: true,
            autoSkip: false,
          },
          gridLines: {
            display: false,
          },
          title: { display: true, text: 'Predicted Label' },
        },
        y: {
          type: 'category',
          labels: [],
          offset: true,
          reverse: true,
          ticks: {
            display: true,
            autoSkip: false,
          },
          gridLines: {
            display: false,
          },
          title: { display: true, text: 'True Label' },
        },
      },
      onClick(e) {
        try {
          const dataIndex = e.chart.tooltip.dataPoints[0].dataIndex;
          if (selectedDataIndex === dataIndex) {
            selected.set(null);
            selectedDataIndex = -1;
          } else {
            selected.set(e.chart.tooltip.dataPoints[0].raw);
            selectedDataIndex = dataIndex;
            e.chart.update();
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log('[confusion matrix] selection error:', error);
        }
      },
    },
  };

  let chart;
  let subs = [];
  function setup(canvasElement) {
    const ctx = canvasElement.getContext('2d');
    chart = new Chart(ctx, defaultOptions);
    subs.push(
      labels.subscribe((labs) => {
        nLabels = labs.length;
        defaultOptions.options.scales.x.labels = labs.sort();
        defaultOptions.options.scales.y.labels = labs.sort();
        chart.update();
      }),
    );
    subs.push(
      confusion.subscribe((conf) => {
        maxCount = conf.reduce((m, { v }) => Math.max(m, v), 0);
        defaultOptions.data.datasets[0].data = conf;
        chart.update();
      }),
    );
  }

  onDestroy(() => {
    for (const s of subs) {
      s.unsubscribe();
    }
  });
</script>

<ViewContainer {title} loading={$loading} progress={$progress}>
  {#if $accuracy !== undefined}
    <p class="m-2">Global Accuracy: {$accuracy.toFixed(2)}</p>
    <div class="confusion-container"><canvas use:setup /></div>
  {:else}
    <p class="m-2">Waiting for predictions...</p>
  {/if}
</ViewContainer>

<style>
  .confusion-container {
    width: 350px;
    max-width: 100%;
    height: 350px;
  }
</style>
