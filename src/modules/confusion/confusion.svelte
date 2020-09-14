<script>
  import { onMount, onDestroy } from 'svelte';
  import { chart } from 'svelte-apexcharts';

  export let title;
  export let confusion;
  export let accuracy;

  let options = {
    chart: { type: 'heatmap', width: '300px', height: '300px' },
    dataLabels: {
      enabled: false,
    },
    colors: ['#008FFB'],
    title: {
      text: 'Confusion Matrix',
    },
    xaxis: { title: { text: 'True Label' } },
    yaxis: { title: { text: 'Predicted Label' } },
    series: [],
  };

  let unSub = () => {};
  onMount(() => {
    confusion.subscribe((conf) => {
      options = {
        chart: { type: 'heatmap', width: '300px', height: '300px' },
        dataLabels: {
          enabled: false,
        },
        colors: ['#008FFB'],
        title: {
          text: 'Confusion Matrix',
        },
        series: $confusion,
      };
    });
  });

  onDestroy(() => {
    unSub();
  });
</script>

<span class="card-title">{title}</span>

{#if $accuracy}
  <p class="m-2">Global Accuracy: {$accuracy.toFixed(2)}</p>
  <div use:chart={options} />
{:else}
  <p class="m-2">Waiting for predictions...</p>
{/if}
