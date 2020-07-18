import { tensor2d, train, Tensor2D } from '@tensorflow/tfjs-core';
import { DenseLayerArgs } from '@tensorflow/tfjs-layers/dist/layers/core';
import { sequential, layers as tfLayers, Sequential } from '@tensorflow/tfjs-layers';
import { Dataset } from '../modules/dataset/dataset.module';
import { Stream } from '../core/stream';

export interface MLPParameters {
  layers: number[];
  epochs: number;
}

export interface TrainingStatus {
  status: 'idle' | 'start' | 'epoch' | 'success' | 'error';
  epoch?: number;
  data?: Record<string, unknown>;
}

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

interface MLPResults {
  label: string;
  confidences: { [key: string]: number };
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

function dataSplit(dataset: Dataset, trainProportion: number, numClasses = -1) {
  // split is an interval, between 0 and 1
  const labels = dataset.$labels.value;
  const nClasses = numClasses < 0 ? labels.length : numClasses;
  const data: TrainingData = {
    training: {
      x: tensor2d([[]]),
      y: tensor2d([], [0, nClasses]),
    },
    validation: {
      x: tensor2d([[]]),
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
      const { features } = dataset.getInstance(id);
      if (data.training.x.shape[1] === 0) {
        data.training.x.shape[1] = features[0].length;
      }
      data.training.x = data.training.x.concat(tensor2d(features));
      data.training.y = data.training.y.concat(tensor2d([y]));
    });
    validationIds.forEach((id) => {
      const { features } = dataset.getInstance(id);
      if (data.validation.x.shape[1] === 0) {
        data.validation.x.shape[1] = features[0].length;
      }
      data.validation.x = data.validation.x.concat(tensor2d(features));
      data.validation.y = data.validation.y.concat(tensor2d([y]));
    });
  });
  return data;
}

function arrayArgMax(softmaxes: number[]): number {
  if (softmaxes.length <= 0) return 0;
  let ind = 0;
  let mmax = softmaxes[0];
  for (let i = 1; i < softmaxes.length; i += 1) {
    if (mmax < softmaxes[i]) {
      mmax = softmaxes[i];
      ind = i;
    }
  }
  return ind;
}

const BATCH_SIZE = 8;

export class MLP {
  parameters: MLPParameters;
  labels: string[];
  model: Sequential;

  $training = new Stream<TrainingStatus>({ status: 'idle' });

  constructor({ layers = [64, 32], epochs = 20 }: Partial<MLPParameters> = {}) {
    this.parameters = { layers, epochs };
  }

  train(dataset: Dataset): void {
    console.log('Train model from dataset', dataset, 'with parameters', this.parameters);
    this.labels = dataset.$labels.value;
    if (this.labels.length < 2) {
      this.$training.set({ status: 'error' });
      throw new Error('Cannot train a MLP with less than 2 classes');
    }
    this.$training.set({ status: 'start' });
    setTimeout(() => {
      const data = dataSplit(dataset, 0.75);
      this.buildModel(data.training.x.shape[1], data.training.y.shape[1]);
      this.fit(data);
    }, 1);
  }

  buildModel(inputDim: number, numClasses: number): void {
    console.log('[MLP] Building a model with layers:', this.parameters.layers);
    this.model = sequential();
    this.parameters.layers.forEach((units, i) => {
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
    const numEpochs = epochs > 0 ? epochs : this.parameters.epochs;
    this.model
      .fit(data.training.x, data.training.y, {
        batchSize: BATCH_SIZE,
        validationData: [data.validation.x, data.validation.y],
        epochs: numEpochs,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            this.$training.set({
              status: 'epoch',
              epoch,
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
        // eslint-disable-next-line no-console
        console.log('[MLP] Training has ended with results:', results);
        this.$training.set({ status: 'success', data: results.history });
      })
      .catch(() => {
        this.$training.set({ status: 'error' });
      });
  }

  clear(): void {
    delete this.model;
  }

  predict(x: number[][]): MLPResults {
    const pred = this.model.predict(tensor2d(x)) as Tensor2D;
    const softmaxes = pred.arraySync()[0];
    const ypred = arrayArgMax(softmaxes);
    const label = this.labels[ypred];
    const confidences = softmaxes.reduce((c, y, i) => ({ ...c, [this.labels[i]]: y }), {});
    return { label, confidences };
  }
}

export function mlp(parameters: Partial<MLPParameters>): MLP {
  return new MLP(parameters);
}
