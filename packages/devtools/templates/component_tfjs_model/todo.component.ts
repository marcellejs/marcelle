import { ServiceIterable, Instance, TFJSCustomModelOptions, Dataset } from '@marcellejs/core';
import type { Tensor, Tensor2D } from '@tensorflow/tfjs-core';
import { TFJSCustomModel, Stream } from '@marcellejs/core';
import { tidy, tensor, train } from '@tensorflow/tfjs-core';
import { sequential, layers, metrics } from '@tensorflow/tfjs-layers';

export interface TodoOptions extends TFJSCustomModelOptions {
  units: [number, number];
}

type InputType = number[];
type OutputType = number;
type PredictionType = number;

/**
 * A Multi-layer Perceptron for regression with two hidden layers
 */
export class Todo extends TFJSCustomModel<InputType, OutputType, PredictionType> {
  parameters: {
    units: Stream<number>;
  } & TFJSCustomModel<InputType, OutputType, PredictionType>['parameters'];

  constructor({ units = [64, 32], ...rest }: Partial<TodoOptions> = {}) {
    super(rest);
    this.title = 'Todo';
    this.parameters = {
      units: new Stream(units, true),
      ...this.parameters,
    };
  }

  async train(
    dataset: Dataset<InputType, OutputType> | ServiceIterable<Instance<InputType, OutputType>>,
    validationDataset?:
      | Dataset<InputType, OutputType>
      | ServiceIterable<Instance<InputType, OutputType>>,
  ): Promise<void> {
    this.transformDataset = (ds) =>
      ds.map((instance) => ({
        xs: tensor(instance.x),
        ys: tensor(instance.y),
      }));

    super.train(dataset, validationDataset);
  }

  buildModel(inputShape: Tensor['shape']): void {
    const units = this.parameters.units.get();
    this.model = sequential();
    this.model.add(
      layers.dense({
        units: units[0],
        activation: 'relu',
        inputDim: inputShape[0],
      }),
    );
    this.model.add(
      layers.dense({
        units: units[0],
        activation: 'relu',
      }),
    );
    this.model.add(
      layers.dense({
        units: 1,
      }),
    );
    const optimizer = train.adam();
    this.model.compile({
      optimizer,
      loss: 'meanSquaredError',
      metrics: [metrics.meanAbsoluteError],
    });
  }

  async predict(x: InputType): Promise<PredictionType> {
    if (!this.model) return null;
    return tidy(() => this._predict(x).arraySync()[0]);
  }
}
