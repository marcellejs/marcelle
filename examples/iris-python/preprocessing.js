import { ts } from './data';

export function processDataset() {
  return ts.items().map((instance) => ({
    x: [
      [
        instance['sepal.length'],
        instance['sepal.width'],
        instance['petal.length'],
        instance['petal.width'],
      ],
    ],
    y: instance.variety,
  }));
}
