import { train, tidy, type TensorLike, tensor, type Tensor } from '@tensorflow/tfjs-core';
import { sequential, layers as tfLayers, metrics } from '@tensorflow/tfjs-layers';
import { TFJSCustomModel, type TFJSCustomModelOptions } from '../../core/model/tfjs-custom-model';
import type { Dataset, Instance } from '../../core';
import type { LazyIterable } from '../../utils';
import { BehaviorSubject } from 'rxjs';

export interface MLPRegressorOptions extends TFJSCustomModelOptions {
  units: number[];
}

export interface MLPRegressorInstance extends Instance {
  x: TensorLike;
  y: number;
}

export class MLPRegressor extends TFJSCustomModel<MLPRegressorInstance, number | number[]> {
  title = 'MLPRegressor';

  parameters: {
    units: BehaviorSubject<number[]>;
  } & TFJSCustomModel<MLPRegressorInstance, number | number[]>['parameters'];

  constructor({ units = [64, 32], ...rest }: Partial<MLPRegressorOptions> = {}) {
    super(rest);
    this.parameters = {
      units: new BehaviorSubject(units),
      ...this.parameters,
    };
  }

  async train(
    dataset: Dataset<MLPRegressorInstance> | LazyIterable<MLPRegressorInstance>,
    validationDataset?: Dataset<MLPRegressorInstance> | LazyIterable<MLPRegressorInstance>,
  ) {
    this.transformDataset = (ds) =>
      ds.map((instance) => ({
        xs: tensor(instance.x),
        ys: tensor(instance.y),
      }));

    super.train(dataset, validationDataset);
  }

  buildModel(inputShape: Tensor['shape'], outputShape: Tensor['shape']) {
    const units = this.parameters.units.getValue();
    this.model = sequential();
    this.model.add(tfLayers.inputLayer({ inputShape }));
    for (const u of units) {
      this.model.add(
        tfLayers.dense({
          units: u,
          activation: 'relu',
        }),
      );
    }
    this.model.add(
      tfLayers.dense({
        units: outputShape.length > 0 ? outputShape[0] : 1,
      }),
    );
    const optimizer = train.adam();
    this.model.compile({
      optimizer,
      loss: 'meanSquaredError',
      metrics: [metrics.meanAbsoluteError],
    });
  }

  async predict(x: TensorLike) {
    if (!this.model) return null;
    return tidy(() => {
      const pred = this._predict(x).arraySync() as number[];
      return pred.length === 1 ? pred[0] : pred;
    });
  }
}
