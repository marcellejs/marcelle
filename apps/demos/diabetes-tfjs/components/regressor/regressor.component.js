import { TFJSCustomModel, Stream } from '@marcellejs/core';
import { tidy, tensor, train } from '@tensorflow/tfjs-core';
import { sequential, layers, metrics } from '@tensorflow/tfjs-layers';

/**
 * A Multi-layer Perceptron for regression with two hidden layers
 */
export class Regressor extends TFJSCustomModel {
  constructor({ units = [64, 32], ...rest } = {}) {
    super(rest);
    this.title = 'Regressor';
    this.parameters = {
      units: new Stream(units, true),
      ...this.parameters,
    };
  }

  async train(dataset, validationDataset) {
    this.transformDataset = (ds) =>
      ds.map((instance) => ({
        xs: tensor(instance.x),
        ys: tensor(instance.y),
      }));

    super.train(dataset, validationDataset);
  }

  buildModel(inputShape) {
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

  async predict(x) {
    if (!this.model) return null;
    return tidy(() => {
      const pred = this._predict(x).arraySync()[0];
      return pred;
    });
  }
}
