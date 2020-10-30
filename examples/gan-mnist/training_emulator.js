/* global marcelle */

function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
}

/**
 * Simple module for training a GAN on a Python Server from the MNIST Dataset
 *
 * @see server.py
 */
export class GanTrainer {
  constructor({
    epochs = 3000,
    sample_images_interval = 50,
    sample_models_interval = 5000,
    sample_models_at = [0, 100, 250, 500, 1000, 2000],
  } = {}) {
    this.id = 'remote-gan-emulator';
    this.name = 'remote GAN (Emulator)';
    this.parameters = {
      epochs: marcelle.createStream(epochs, true),
    };
    this.params = {
      sample_images_interval,
      sample_models_interval,
      sample_models_at,
    };
    this.$models = marcelle.createStream([], true);
    this.$training = marcelle.createStream({ status: 'idle' }, true);
    this.trainingData = null;
    this.stopTraining = false;
    fetch('training_log.json')
      .then((response) => response.json())
      .then((trainingData) => {
        this.trainingData = trainingData;
        this.$models.set(trainingData.filter((x) => !!x.model).map((x) => `${x.model}/model.json`));
      });

    // this.ws.onmessage = (event) => {
    //   const { type, data } = JSON.parse(event.data);
    //   switch (type) {
    //     case 'trainingStatus':
    //       this.$training.set(data);
    //       break;

    //     case 'models':
    //       this.$models.set(data);
    //       break;

    //     default:
    //       break;
    //   }
    // };
  }

  async train() {
    this.stopTraining = false;
    for (let i = 0; i < this.trainingData.length; i++) {
      this.$training.set(this.trainingData[i]);
      // eslint-disable-next-line no-await-in-loop
      await sleep(1);
      if (this.stopTraining) break;
    }
  }

  stop() {
    this.stopTraining = true;
  }

  // eslint-disable-next-line class-methods-use-this
  mount() {}
}

export function plotGanTraining(ganModel) {
  const discriminatorLoss = marcelle.createStream([], true);
  const generatorLoss = marcelle.createStream([], true);
  const plotLosses = marcelle.chart({
    preset: 'line-fast',
    options: {
      xlabel: 'Epoch',
      ylabel: 'Loss',
    },
  });
  plotLosses.addSeries(discriminatorLoss, 'discriminator loss');
  plotLosses.addSeries(generatorLoss, 'generator loss');
  plotLosses.name = 'losses';

  const discriminatorAccuracy = marcelle.createStream([], true);
  const plotAccuracy = marcelle.chart({
    preset: 'line-fast',
    options: {
      xlabel: 'Epoch',
      ylabel: 'Accuracy',
    },
  });
  plotAccuracy.addSeries(discriminatorAccuracy, 'discriminator accuracy');
  plotAccuracy.name = 'discriminator accuracy';

  ganModel.$training.subscribe((x) => {
    if (x.status === 'start') {
      discriminatorLoss.set([]);
      generatorLoss.set([]);
      discriminatorAccuracy.set([]);
    } else if (x.status === 'epoch') {
      discriminatorLoss.set(discriminatorLoss.value.concat([x.data.discriminatorLoss]));
      generatorLoss.set(generatorLoss.value.concat([x.data.generatorLoss]));
      discriminatorAccuracy.set(discriminatorAccuracy.value.concat([x.data.discriminatorAcc]));
    }
  });
  return [plotLosses, plotAccuracy];
}
