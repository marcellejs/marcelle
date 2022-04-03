import { GenericChart, GenericChartOptions } from './generic-chart.component';

export function genericChart(options: GenericChartOptions): GenericChart {
  return new GenericChart(options);
}

export type { GenericChart, GenericChartOptions };
