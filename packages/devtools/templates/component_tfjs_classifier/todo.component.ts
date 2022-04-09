import { TFJSCustomClassifier, TFJSCustomClassifierOptions, Stream } from '@marcellejs/core';
import { train, Tensor } from '@tensorflow/tfjs-core';
import { sequential, layers } from '@tensorflow/tfjs-layers';

export interface TodoOptions extends TFJSCustomClassifierOptions {
  units: [number, number];
}

/**
 * A Multi-layer Perceptron for classification with two hidden layers
 */
export class Todo extends TFJSCustomClassifier {
  parameters: {
    units: Stream<number[]>;
  } & TFJSCustomClassifier['parameters'];

  constructor({ units = [64, 32], ...rest }: Partial<TodoOptions> = {}) {
    super(rest);
    this.title = 'Todo';
    this.parameters = {
      units: new Stream(units, true),
      ...this.parameters,
    };
  }

  buildModel(inputShape: Tensor['shape'], outputShape: Tensor['shape']): void {
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
        units: outputShape[0],
        activation: 'softmax',
      }),
    );
    const optimizer = train.adam();
    this.model.compile({
      optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });
  }
}
