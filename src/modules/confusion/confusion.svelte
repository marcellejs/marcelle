<script>
  import { onMount, onDestroy } from 'svelte';
  import { chart } from 'svelte-apexcharts';

  export let title;
  export let confusion;

  let options = {
    chart: { type: 'heatmap', width: '300px', height: '300px' },
    dataLabels: {
      enabled: false,
    },
    colors: ['#008FFB'],
    title: {
      text: 'Confusion Matrix',
    },
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

<div use:chart={options} />
