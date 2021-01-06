/* global marcelle */

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
    this.id = 'remote-gan';
    this.name = 'remote GAN';
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
    this.ws = new WebSocket('ws://127.0.0.1:8765/');
    this.ws.onopen = () => {
      marcelle.logger.log('Websocket connection open');
      this.ws.send(JSON.stringify({ action: 'list' }));
    };

    this.ws.onerror = (e) => {
      e.name = 'Websocket connection error';
      e.message = `Connection failed with websocket server ${e.target.url}`;
      marcelle.throwError(e);
    };

    this.ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      switch (type) {
        case 'trainingStatus':
          this.$training.set(data);
          if (data.status === 'start') {
            this.$models.set([]);
          }
          if (data.model) {
            this.$models.set(this.$models.value.concat([data.model]));
          }
          break;

        case 'models':
          this.$models.set(data);
          break;

        default:
          break;
      }
    };
  }

  connect() {}

  train() {
    const parameters = Object.entries(this.parameters).reduce(
      (p, [name, s]) => ({ ...p, [name]: s.value }),
      {},
    );
    this.ws.send(
      JSON.stringify({
        action: 'train',
        parameters: { ...parameters, ...this.params },
      }),
    );
  }

  stop() {
    this.ws.send(
      JSON.stringify({
        action: 'stop',
      }),
    );
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
  plotLosses.title = 'losses';

  const discriminatorAccuracy = marcelle.createStream([], true);
  const plotAccuracy = marcelle.chart({
    preset: 'line-fast',
    options: {
      xlabel: 'Epoch',
      ylabel: 'Accuracy',
    },
  });
  plotAccuracy.addSeries(discriminatorAccuracy, 'discriminator accuracy');
  plotAccuracy.title = 'discriminator accuracy';

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
