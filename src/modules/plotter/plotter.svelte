<script>
  import { onMount, onDestroy } from 'svelte';
  import { chart } from 'svelte-apexcharts';
  import { mergeDeep } from '../../utils/object.ts';
  import ModuleBase from '../../core/ModuleBase.svelte';

  export let title;
  export let options;
  export let series;

  const defaultOptions = {
    chart: {
      height: 350,
      type: 'line',
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    theme: {
      palette: 'palette1', // upto palette10
    },
    title: {
      text: title,
    },
    stroke: {
      curve: 'smooth',
    },
    yaxis: {
      labels: {
        formatter(x) {
          return x.toFixed(2);
        },
      },
    },
    series: [],
  };

  let chartOptions = { ...defaultOptions };
  let unSub = [];
  onMount(() => {
    chartOptions = mergeDeep(defaultOptions, options);
    unSub = series.map((s) =>
      s.data.subscribe((values) => {
        if (values) {
          chartOptions = mergeDeep(defaultOptions, options, {
            plotOptions: {
              bar: {
                distributed: true,
              },
            },
          });
          chartOptions.series = series.map((x) => ({ name: x.name, data: x.data.value }));
        }
      }),
    );
  });

  onDestroy(() => {
    unSub.forEach((f) => f());
  });
</script>

<ModuleBase {title}>
  <div use:chart={chartOptions} />
</ModuleBase>
