import {
  tensor2d,
  tensor4d,
  train,
  tensor,
  tidy,
  keep,
  image,
  browser,
} from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-core/dist/public/chained_ops/concat';
import '@tensorflow/tfjs-core/dist/public/chained_ops/gather';
import '@tensorflow/tfjs-core/dist/public/chained_ops/arg_max';
import '@tensorflow/tfjs-core/dist/public/chained_ops/div';
import '@tensorflow/tfjs-core/dist/public/chained_ops/sub';
import { loadLayersModel, layers as tfLayers, model as tfModel } from '@tensorflow/tfjs-layers';
import { Stream, logger, TFJSBaseModel, isDataset, throwError } from '@marcellejs/core';

function shuffleArray(a) {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = b[i];
    b[i] = b[j];
    b[j] = temp;
  }
  return b;
}

async function dataSplit(dataset, imgSize, trainProportion, labels) {
  const classes = labels.reduce((c, l) => ({ ...c, [l]: [] }), {});
  for await (const { x, y } of dataset) {
    classes[y].push(x);
  }

  let data;
  tidy(() => {
    data = {
      training_x: tensor4d([], [0, imgSize, imgSize, 3]),
      training_y: tensor2d([], [0, labels.length]),
      validation_x: tensor4d([], [0, imgSize, imgSize, 3]),
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
      for (const instance of trainingInstances) {
        const x = image
          .resizeBilinear(browser.fromPixels(instance), [imgSize, imgSize])
          .div(127.5)
          .sub(1.0)
          .expandDims(0);
        data.training_x = data.training_x.concat(x);
        data.training_y = data.training_y.concat(tensor2d([y]));
      }
      for (const instance of validationInstances) {
        const x = image
          .resizeBilinear(browser.fromPixels(instance), [imgSize, imgSize])
          .div(127.5)
          .sub(1.0)
          .expandDims(0);
        data.validation_x = data.validation_x.concat(x);
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

export class ImageClassifier extends TFJSBaseModel {
  constructor({ layers = [64, 32], epochs = 20, batchSize = 8, ...rest } = {}) {
    super(rest);
    this.title = 'Image Classifier';
    this.mobilenet = undefined;
    this.model = undefined;
    this.parameters = {
      layers: new Stream(layers, true),
      epochs: new Stream(epochs, true),
      batchSize: new Stream(batchSize, true),
    };
    this.start();
    this.ready = false;
    loadLayersModel('/mobilenet_v2/model.json').then((m) => {
      this.mobilenet = m;
      this.mobilenet.trainable = false;
      for (const l of this.mobilenet.layers) {
        l.trainable = false;
      }
      this.ready = true;
      console.log('this.mobilenet', this.mobilenet);
    });
  }

  async train(dataset) {
    this.labels = isDataset(dataset)
      ? await dataset.distinct('y')
      : // eslint-disable-next-line no-undef
        (this.labels = Array.from(new Set(await dataset.map(({ y }) => y).toArray())));
    const ds = isDataset(dataset) ? dataset.items() : dataset;
    this.$training.set({ status: 'start', epochs: this.parameters.epochs.get() });
    if (this.labels.length === 0) {
      throwError(new Error('This dataset is empty or is missing labels'));
      this.$training.set({
        status: 'error',
      });
      return;
    }
    setTimeout(async () => {
      const data = await dataSplit(ds, 224, 0.75, this.labels);
      this.buildModel(data.training_x.shape[1], data.training_y.shape[1]);
      this.fit(data);
    }, 100);
  }

  async predict(img) {
    if (!this.model) return { label: undefined, confidences: {} };
    return tidy(() => {
      const x = image
        .resizeBilinear(browser.fromPixels(img), [224, 224])
        .div(127.5)
        .sub(1.0)
        .expandDims(0);
      const pred = this.model.predict(x);
      const label = this.labels[pred.gather(0).argMax().arraySync()];
      const softmaxes = pred.arraySync()[0];
      const confidences = softmaxes.reduce((c, y, i) => ({ ...c, [this.labels[i]]: y }), {});
      return { label, confidences };
    });
  }

  clear() {
    delete this.model;
  }

  buildModel(inputDim, numClasses) {
    let previousOutput = this.mobilenet.layers[this.mobilenet.layers.length - 2].output;
    for (const [i, units] of this.parameters.layers.get().entries()) {
      const layerParams = {
        units,
        activation: 'relu', // potentially add kernel init
      };
      const l = tfLayers.dense(layerParams);
      previousOutput = l.apply(previousOutput);
    }

    const outputs = tfLayers
      .dense({
        units: numClasses,
        activation: 'softmax',
      })
      .apply(previousOutput);

    this.model = tfModel({ inputs: this.mobilenet.input, outputs });
    this.model.summary();
    console.log('this.model', this.model);
    const optimizer = train.adam();
    this.model.compile({
      optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });
  }

  fit(data, epochs = -1) {
    const numEpochs = epochs > 0 ? epochs : this.parameters.epochs.get();
    this.model
      .fit(data.training_x, data.training_y, {
        batchSize: this.parameters.batchSize.get(),
        validationData: [data.validation_x, data.validation_y],
        epochs: numEpochs,
        shuffle: true,
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
        throw new Error(error.message);
      })
      .finally(() => {
        data.training_x.dispose();
        data.training_y.dispose();
        data.validation_x.dispose();
        data.validation_y.dispose();
      });
  }
}
