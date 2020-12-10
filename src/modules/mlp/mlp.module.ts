import { tensor2d, train, Tensor2D, TensorLike, tensor, tidy } from '@tensorflow/tfjs-core';
import {
  loadLayersModel,
  sequential,
  layers as tfLayers,
  Sequential,
} from '@tensorflow/tfjs-layers';
import type { DenseLayerArgs } from '@tensorflow/tfjs-layers/dist/layers/core';
import { Stream, TFJSClassifier, logger, ClassifierResults } from '../../core';
import { Dataset } from '../dataset/dataset.module';
import { Catch, TrainingError } from '../../utils/error-handling';

interface TrainingData {
  training: {
    x: Tensor2D;
    y: Tensor2D;
  };
  validation: {
    x: Tensor2D;
    y: Tensor2D;
  };
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

async function dataSplit(dataset: Dataset, trainProportion: number, numClasses = -1) {
  // split is an interval, between 0 and 1
  const allInstances = await Promise.all(
    dataset.$instances.value.map((id) =>
      dataset.instanceService.get(id, { query: { $select: ['id', 'features'] } }),
    ),
  );

  const labels = dataset.$labels.value;
  const nClasses = numClasses < 0 ? labels.length : numClasses;
  const data: TrainingData = {
    training: {
      x: tensor2d([], [0, 1]),
      y: tensor2d([], [0, nClasses]),
    },
    validation: {
      x: tensor2d([], [0, 1]),
      y: tensor2d([], [0, nClasses]),
    },
  };
  labels.forEach((label: string) => {
    const instances = dataset.$classes.value[label];
    const numInstances = instances.length;
    const shuffledIds = shuffleArray(instances);
    const thresh = Math.floor(trainProportion * numInstances);
    const trainingIds = shuffledIds.slice(0, thresh);
    const validationIds = shuffledIds.slice(thresh, numInstances);
    const y = Array(nClasses).fill(0);
    y[labels.indexOf(label)] = 1;
    trainingIds.forEach((id) => {
      const { features } = allInstances.find((x) => x.id === id) as { features: number[][] };
      if (data.training.x.shape[1] === 0) {
        data.training.x.shape[1] = features[0].length;
      }
      data.training.x = data.training.x.concat(tensor2d(features));
      data.training.y = data.training.y.concat(tensor2d([y]));
    });
    validationIds.forEach((id) => {
      const { features } = allInstances.find((x) => x.id === id) as { features: number[][] };
      if (data.validation.x.shape[1] === 0) {
        data.validation.x.shape[1] = features[0].length;
      }
      data.validation.x = data.validation.x.concat(tensor2d(features));
      data.validation.y = data.validation.y.concat(tensor2d([y]));
    });
  });
  return data;
}

export interface MLPOptions {
  layers: number[];
  epochs: number;
  batchSize: number;
}

export class MLP extends TFJSClassifier {
  name = 'MLP';

  model: Sequential;
  loadFn = loadLayersModel;

  static nextModelId = 0;
  modelId = `mlp-${MLP.nextModelId++}`;

  parameters: {
    layers: Stream<number[]>;
    epochs: Stream<number>;
    batchSize: Stream<number>;
  };

  constructor({ layers = [64, 32], epochs = 20, batchSize = 8 }: Partial<MLPOptions> = {}) {
    super();
    this.parameters = {
      layers: new Stream(layers, true),
      epochs: new Stream(epochs, true),
      batchSize: new Stream(batchSize, true),
    };
  }

  @Catch
  train(dataset: Dataset): void {
    this.labels = dataset.$labels.value || [];
    if (this.labels.length < 2) {
      this.$training.set({ status: 'error' });
      throw new TrainingError('Cannot train a MLP with less than 2 classes');
    }
    this.$training.set({ status: 'start', epochs: this.parameters.epochs.value });
    setTimeout(async () => {
      const data = await dataSplit(dataset, 0.75);
      this.buildModel(data.training.x.shape[1], data.training.y.shape[1]);
      this.fit(data);
    }, 100);
  }

  async predict(x: TensorLike): Promise<ClassifierResults> {
    if (!this.model) return null;
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
    this.parameters.layers.value.forEach((units, i) => {
      const layerParams: DenseLayerArgs = {
        units,
        activation: 'relu', // potentially add kernel init
      };
      if (i === 0) {
        layerParams.inputDim = inputDim;
      }
      this.model.add(tfLayers.dense(layerParams));
    });
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
      .fit(data.training.x, data.training.y, {
        batchSize: this.parameters.batchSize.value,
        validationData: [data.validation.x, data.validation.y],
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
        this.save();
      })
      .catch((error) => {
        this.$training.set({ status: 'error', data: error });
        throw new TrainingError(error.message);
      });
  }
}
