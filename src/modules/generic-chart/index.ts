import { GenericChart, GenericChartOptions } from './generic-chart.module';

export function genericChart(options: GenericChartOptions): GenericChart {
  return new GenericChart(options);
}

export type { GenericChart, GenericChartOptions };
