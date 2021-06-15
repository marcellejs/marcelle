import { tensor2d, train, Tensor2D, TensorLike, tensor, tidy, keep } from '@tensorflow/tfjs-core';
import type { TensorLike2D } from '@tensorflow/tfjs-core/dist/types';
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
import type { ServiceIterable } from '../../data-store/service-iterable';
import { Dataset, isDataset } from '../../dataset';
import { Catch, TrainingError } from '../../utils/error-handling';

interface TrainingData {
  training_x: Tensor2D;
  training_y: Tensor2D;
  validation_x: Tensor2D;
  validation_y: Tensor2D;
}

function shuffleArray<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = b[i];
    b[i] = b[j];
    b[j] = temp;
  }
  return b;
}

async function dataSplit(
  dataset: ServiceIterable<Instance<TensorLike, string>>,
  trainProportion: number,
  labels: string[],
): Promise<TrainingData> {
  const classes: Record<string, TensorLike[]> = labels.reduce((c, l) => ({ ...c, [l]: [] }), {});
  for await (const { x, y } of dataset) {
    classes[y].push(x);
  }

  let data: TrainingData;
  tidy(() => {
    data = {
      training_x: tensor2d([], [0, 1]),
      training_y: tensor2d([], [0, labels.length]),
      validation_x: tensor2d([], [0, 1]),
      validation_y: tensor2d([], [0, labels.length]),
    };
    for (const label of labels) {
      const instances = classes[label];
      const numInstances = instances.length;
      const shuffledInstances = shuffleArray(instances);
      const thresh = Math.floor(trainProportion * numInstances);
      const trainingInstances = shuffledInstances.slice(0, thresh);
      const validationInstances = shuffledInstances.slice(thresh, numInstances);
      const y = Array(labels.length).fill(0);
      y[labels.indexOf(label)] = 1;
      for (const features of trainingInstances) {
        if (data.training_x.shape[1] === 0) {
          data.training_x.shape[1] = (features as number[][])[0].length;
        }
        data.training_x = data.training_x.concat(tensor2d(features as TensorLike2D));
        data.training_y = data.training_y.concat(tensor2d([y]));
      }
      for (const features of validationInstances) {
        if (data.validation_x.shape[1] === 0) {
          data.validation_x.shape[1] = (features as number[][])[0].length;
        }
        data.validation_x = data.validation_x.concat(tensor2d(features as TensorLike2D));
        data.validation_y = data.validation_y.concat(tensor2d([y]));
      }
    }
    keep(data.training_x);
    keep(data.training_y);
    keep(data.validation_x);
    keep(data.validation_y);
  });
  return data;
}

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
    this.labels = isDataset(dataset)
      ? await dataset.distinct('y')
      : (this.labels = Array.from(new Set(await dataset.map(({ y }) => y).toArray())));
    const ds = isDataset(dataset) ? dataset.items() : dataset;
    this.$training.set({ status: 'start', epochs: this.parameters.epochs.value });
    setTimeout(async () => {
      const data = await dataSplit(ds, 0.75, this.labels);
      this.buildModel(data.training_x.shape[1], data.training_y.shape[1]);
      this.fit(data);
    }, 100);
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
    for (const [i, units] of this.parameters.layers.value.entries()) {
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

  fit(data: TrainingData, epochs = -1): void {
    const numEpochs = epochs > 0 ? epochs : this.parameters.epochs.value;
    this.model
      .fit(data.training_x, data.training_y, {
        batchSize: this.parameters.batchSize.value,
        validationData: [data.validation_x, data.validation_y],
        epochs: numEpochs,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            this.$training.set({
              status: 'epoch',
              epoch,
              epochs: this.parameters.epochs.value,
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
      })
      .finally(() => {
        data.training_x.dispose();
        data.training_y.dispose();
        data.validation_x.dispose();
        data.validation_y.dispose();
      });
  }
}
