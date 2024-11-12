import { GenericChart } from './generic-chart.component';

export function genericChart(...args: ConstructorParameters<typeof GenericChart>): GenericChart {
  return new GenericChart(...args);
}

export * from './generic-chart.component';
