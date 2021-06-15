---
sidebarDepth: 3
---

# Charts

## genericChart

```tsx
genericChart({
  preset?: 'line' | 'line-fast' | 'bar' | 'bar-fast';
  options?: ChartOptions;
}): Chart;
```

A Charting component using the [Chart.js](#) library, to visualize data streams.

### Parameters

| Option  | Type         | Description                                                                     | Required | Default |
| ------- | ------------ | ------------------------------------------------------------------------------- | :------: | :-----: |
| preset  | string       | The chart preset. Available presets are 'line', 'line-fast', 'bar', 'bar-fast'. |          | 'line'  |
| options | ChartOptions | Custom Chart Options                                                            |          |   {}    |

Custom chart options can be passed as an object that is compatible with Chart.js's options ([see online documentation](https://www.chartjs.org/docs/next/)), with 2 additional shorthand options `xlabel` and `ylabel`.

<!-- ### Screenshot

<div style="background: rgb(237, 242, 247); padding: 8px; margin-top: 1rem;">
  <img src="./components/images/chart.png" alt="Screenshot of the chart component">
</div> -->

### Example

```js
TODO;
```

## scatterPlot

```tsx
scatterPlot(
  dataset: Stream<number[][]>,
  labels: Stream<string[] | number[]>
  ): ScatterPlot;
```

A scatter plot component using the [scatterGL](https://github.com/PAIR-code/scatter-gl) library.

### Parameters

| Option  | Type                           | Description                                                                         | Required |
| ------- | ------------------------------ | ----------------------------------------------------------------------------------- | :------: |
| dataset | Stream\<number[][]\>           | Stream of number arrays containing 2-dimensional data to be plotted                 |    ✓     |
| labels  | Stream\<string[] \| number[]\> | Stream of labels (either as strings or numbers) used to apply colors on data points |    ✓     |

<!-- ### Screenshot

```js
TODO;
```

### Example

```js
TODO;
``` -->
