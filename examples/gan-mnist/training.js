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
      // eslint-disable-next-line no-console
      console.log('Websocket connexion open');
      this.ws.send(JSON.stringify({ action: 'list' }));
    };

    this.ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      switch (type) {
        case 'trainingStatus':
          this.$training.set(data);
          break;

        case 'models':
          this.$models.set(data);
          break;

        default:
          break;
      }
    };
  }

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
  const plotLosses = marcelle.plotter({
    series: [
      { name: 'discriminator loss', data: discriminatorLoss },
      { name: 'generator loss', data: generatorLoss },
    ],
    options: {
      xaxis: { title: { text: 'Epoch' } },
      yaxis: { title: { text: 'Loss' } },
    },
  });
  plotLosses.name = 'losses';

  const discriminatorAccuracy = marcelle.createStream([], true);
  const plotAccuracy = marcelle.plotter({
    series: [{ name: 'discriminator accuracy', data: discriminatorAccuracy }],
    options: {
      xaxis: { title: { text: 'Epoch' } },
      yaxis: { title: { text: 'Accuracy' }, min: 0, max: 1 },
    },
  });
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
