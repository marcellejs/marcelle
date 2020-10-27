import { Chart, ChartOptions } from './chart.module';

export function chart(options: ChartOptions): Chart {
  return new Chart(options);
}

export type { Chart, ChartOptions };
