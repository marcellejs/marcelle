import { Tensor2D, Tensor, TensorLike, tensor, tidy } from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-core/dist/public/chained_ops/gather';
import '@tensorflow/tfjs-core/dist/public/chained_ops/arg_max';
import '@tensorflow/tfjs-core/dist/public/chained_ops/squeeze';
import '@tensorflow/tfjs-core/dist/public/chained_ops/expand_dims';
import { loadLayersModel, Sequential } from '@tensorflow/tfjs-layers';
import { Dataset, isDataset } from '../../core/dataset';
import { Catch, TrainingError } from '../../utils/error-handling';
import { dataset2tfjs, TFDataset } from '../../core/model/tfjs-utils';
import { TFJSBaseModel } from './tfjs-base-model';
import { Stream } from '../stream';
import type { Instance } from '../types';
import type { LazyIterable } from '../../utils';

export interface TFJSCustomModelOptions {
  epochs: number;
  batchSize: number;
  validationSplit: number;
}

function transformEpochData(data: Record<string, unknown>) {
  const newData: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    const newKey = key.startsWith('val_') ? key.replace('val_', '') + 'Val' : key;
    newData[newKey] = val;
  }
  return newData;
}

export abstract class TFJSCustomModel<InputType, OutputType, PredictionType> extends TFJSBaseModel<
  InputType,
  OutputType,
  PredictionType
> {
  title = 'TFJSCustomModel';

  model: Sequential;
  loadFn = loadLayersModel;

  validationSplit: number;

  parameters: {
    epochs: Stream<number>;
    batchSize: Stream<number>;
  };

  constructor({
    epochs = 20,
    batchSize = 8,
    validationSplit = 0.2,
  }: Partial<TFJSCustomModelOptions> = {}) {
    super();
    this.validationSplit = Math.max(Math.min(validationSplit, 1), 0);
    this.parameters = {
      epochs: new Stream(epochs, true),
      batchSize: new Stream(batchSize, true),
    };
  }

  transformDataset(
    ds: TFDataset<Partial<Instance<InputType, OutputType>>>,
  ): TFDataset<{ xs: Tensor; ys: Tensor }> {
    return ds.map((instance) => ({
      xs: tensor(instance.x as unknown as TensorLike),
      ys: tensor(instance.y as unknown as TensorLike),
    }));
  }

  @Catch
  async train(
    dataset: Dataset<InputType, OutputType> | LazyIterable<Instance<InputType, OutputType>>,
    validationDataset?:
      | Dataset<InputType, OutputType>
      | LazyIterable<Instance<InputType, OutputType>>,
  ): Promise<void> {
    this.$training.set({ status: 'start', epochs: this.parameters.epochs.get() });

    const isDs = isDataset(dataset);
    const count = isDs ? dataset.$count.value : (await dataset.toArray()).length;
    const nFetch = Math.min(200, count);
    const ds = this.transformDataset(dataset2tfjs(dataset, ['x', 'y'], count < 200)).shuffle(
      nFetch,
    );

    let dsTrain: TFDataset<{ xs: Tensor; ys: Tensor }>;
    let dsVal: TFDataset<{ xs: Tensor; ys: Tensor }>;
    if (validationDataset) {
      dsTrain = ds;
      dsVal = this.transformDataset(
        dataset2tfjs(validationDataset, ['x', 'y'], count < 200),
      ).shuffle(nFetch);
    } else {
      const nTrain = Math.floor(count * (1 - this.validationSplit));
      dsTrain = ds.take(nTrain);
      dsVal = this.validationSplit > 0 && ds.skip(nTrain);
    }

    const [{ xs, ys }] = await dsTrain.take(1).toArray();

    this.buildModel(xs.shape, ys.shape);
    this.fit(dsTrain, dsVal);
  }

  abstract predict(x: InputType): Promise<PredictionType>;

  _predict(x: TensorLike): Tensor {
    if (!this.model) return null;
    return tidy(() => {
      const pred = (
        this.model.predict(tensor(x as unknown as TensorLike).expandDims(0)) as Tensor2D
      ).gather(0);
      return pred;
    });
  }

  clear(): void {
    delete this.model;
  }

  abstract buildModel(inputShape: Tensor['shape'], outputShape: Tensor['shape']): void;

  fit(
    dsTrain: TFDataset<{ xs: Tensor; ys: Tensor }>,
    dsVal: TFDataset<{ xs: Tensor; ys: Tensor }>,
  ): void {
    this.model
      .fitDataset(dsTrain.batch(this.parameters.batchSize.get()), {
        ...(dsVal ? { validationData: dsVal.batch(this.parameters.batchSize.get()) } : {}),
        epochs: this.parameters.epochs.get(),
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            this.$training.set({
              status: 'epoch',
              epoch,
              epochs: this.parameters.epochs.get(),
              data: transformEpochData(logs),
            });
          },
        },
      })
      .then((results) => {
        this.$training.set({
          status: 'success',
          data: transformEpochData(results.history),
        });
      })
      .catch((error) => {
        this.$training.set({ status: 'error', data: error });
        throw new TrainingError(error.message);
      });
  }
}
