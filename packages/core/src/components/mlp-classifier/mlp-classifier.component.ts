import type { Dataset as TFDataset } from '@tensorflow/tfjs-data';
import { train, Tensor2D, Tensor, TensorLike, tensor, tidy, oneHot } from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-core/dist/public/chained_ops/gather';
import '@tensorflow/tfjs-core/dist/public/chained_ops/arg_max';
import '@tensorflow/tfjs-core/dist/public/chained_ops/squeeze';
import {
  loadLayersModel,
  sequential,
  layers as tfLayers,
  Sequential,
} from '@tensorflow/tfjs-layers';
import {
  Stream,
  logger,
  ClassifierResults,
  TFJSBaseModelOptions,
  TFJSBaseModel,
  Instance,
} from '../../core';
import type { ServiceIterable } from '../../core/data-store/service-iterable';
import { Dataset, isDataset } from '../../core/dataset';
import { Catch, TrainingError } from '../../utils/error-handling';
import { throwError } from '../../utils/error-handling';
import { dataset2tfjs } from '../../core/model/tfjs-utils';

export interface MLPClassifierOptions extends TFJSBaseModelOptions {
  layers: number[];
  epochs: number;
  batchSize: number;
}

export class MLPClassifier extends TFJSBaseModel<TensorLike, ClassifierResults> {
  title = 'MLPClassifier';

  model: Sequential;
  loadFn = loadLayersModel;

  parameters: {
    layers: Stream<number[]>;
    epochs: Stream<number>;
    batchSize: Stream<number>;
  };

  constructor({
    layers = [64, 32],
    epochs = 20,
    batchSize = 8,
    ...rest
  }: Partial<MLPClassifierOptions> = {}) {
    super(rest);
    this.parameters = {
      layers: new Stream(layers, true),
      epochs: new Stream(epochs, true),
      batchSize: new Stream(batchSize, true),
    };
  }

  @Catch
  async train(
    dataset: Dataset<TensorLike, string> | ServiceIterable<Instance<TensorLike, string>>,
  ): Promise<void> {
    this.$training.set({ status: 'start', epochs: this.parameters.epochs.get() });

    const isDs = isDataset(dataset);
    this.labels = isDs
      ? await dataset.distinct('y')
      : (this.labels = Array.from(new Set(await dataset.map(({ y }) => y).toArray())));
    if (this.labels.length === 0) {
      throwError(new TrainingError('This dataset is empty or is missing labels'));
      this.$training.set({
        status: 'error',
      });
      return;
    }

    const numClasses = this.labels.length;
    const count = isDs ? dataset.$count.value : (await dataset.toArray()).length;
    const nFetch = Math.min(200, count);
    const ds = dataset2tfjs(dataset, ['x', 'y'], count < 200)
      .map((instance: Partial<Instance<TensorLike, string>>) => ({
        xs: tensor(instance.x).squeeze([0]),
        ys: oneHot(this.labels.indexOf(instance.y), numClasses),
      }))
      .shuffle(nFetch);

    const trainTestSplit = 0.75;
    const nTrain = Math.floor(count * trainTestSplit);
    const dsTrain = ds.take(nTrain);
    const dsTest = ds.skip(nTrain);
    const [{ xs }] = await dsTrain.take(1).toArray();
    this.buildModel(xs.shape[0], numClasses);
    this.fit(dsTrain, dsTest);
  }

  async predict(x: TensorLike): Promise<ClassifierResults> {
    if (!this.model) return { label: undefined, confidences: {} };
    return tidy(() => {
      const pred = this.model.predict(tensor(x)) as Tensor2D;
      const label = this.labels[pred.gather(0).argMax().arraySync() as number];
      const softmaxes = pred.arraySync()[0];
      const confidences = softmaxes.reduce((c, y, i) => ({ ...c, [this.labels[i]]: y }), {});
      return { label, confidences };
    });
  }

  clear(): void {
    delete this.model;
  }

  buildModel(inputDim: number, numClasses: number): void {
    logger.debug('[MLP] Building a model with layers:', this.parameters.layers);
    this.model = sequential();
    for (const [i, units] of this.parameters.layers.get().entries()) {
      const layerParams: Parameters<typeof tfLayers.dense>[0] = {
        units,
        activation: 'relu', // potentially add kernel init
      };
      if (i === 0) {
        layerParams.inputDim = inputDim;
      }
      this.model.add(tfLayers.dense(layerParams));
    }

    this.model.add(
      tfLayers.dense({
        units: numClasses,
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

  fit(
    dsTrain: TFDataset<{ xs: Tensor; ys: Tensor }>,
    dsVal: TFDataset<{ xs: Tensor; ys: Tensor }>,
  ): void {
    this.model
      .fitDataset(dsTrain.batch(this.parameters.batchSize.get()), {
        validationData: dsVal.batch(this.parameters.batchSize.get()),
        epochs: this.parameters.epochs.get(),
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            this.$training.set({
              status: 'epoch',
              epoch,
              epochs: this.parameters.epochs.get(),
              data: {
                accuracy: logs.acc,
                loss: logs.loss,
                accuracyVal: logs.val_acc,
                lossVal: logs.val_loss,
              },
            });
          },
        },
      })
      .then((results) => {
        logger.debug('[MLP] Training has ended with results:', results);
        this.$training.set({
          status: 'success',
          data: {
            accuracy: results.history.acc,
            loss: results.history.loss,
            accuracyVal: results.history.val_acc,
            lossVal: results.history.val_loss,
          },
        });
      })
      .catch((error) => {
        this.$training.set({ status: 'error', data: error });
        throw new TrainingError(error.message);
      });
  }
}
