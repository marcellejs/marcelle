import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import { MLP } from '../mlp';
import { plotter, Plotter } from '../plotter';

export class TrainingPlotter extends Module {
  name = 'training plotter';
  description = 'Plot the loss/accuracy during training';

  plotLosses: Plotter;
  plotAccuracies: Plotter;

  constructor(public model: MLP) {
    super();
    if (!model || !model.$training) {
      throw new Error('This model is incompatible with this module');
    }
    const trainingLoss = new Stream([], true);
    const validationLoss = new Stream([], true);
    this.plotLosses = plotter({
      series: [
        { name: 'training loss', data: trainingLoss },
        { name: 'validation loss', data: validationLoss },
      ],
      options: {
        xaxis: { title: { text: 'Epoch' } },
        yaxis: { title: { text: 'Loss' } },
      },
    });
    this.plotLosses.name = 'losses';

    const trainingAccuracy = new Stream([], true);
    const validationAccuracy = new Stream([], true);
    this.plotAccuracies = plotter({
      series: [
        { name: 'training accuracy', data: trainingAccuracy },
        { name: 'validation accuracy', data: validationAccuracy },
      ],
      options: {
        xaxis: { title: { text: 'Epoch' } },
        yaxis: { title: { text: 'Accuracy' }, min: 0, max: 1 },
      },
    });
    this.plotAccuracies.name = 'accuracies';

    model.$training.subscribe((x) => {
      if (x.status === 'start') {
        trainingLoss.set([]);
        validationLoss.set([]);
        trainingAccuracy.set([]);
        validationAccuracy.set([]);
      } else if (x.status === 'epoch') {
        trainingLoss.set(trainingLoss.value.concat([x.data.loss]));
        validationLoss.set(validationLoss.value.concat([x.data.lossVal]));
        trainingAccuracy.set(trainingAccuracy.value.concat([x.data.accuracy]));
        validationAccuracy.set(validationAccuracy.value.concat([x.data.accuracyVal]));
      }
    });
    this.start();
  }

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    target.classList.add('flex', 'flex-row', 'flex-wrap', 'items-stretch');
    if (!target) return;
    const divLoss = document.createElement('div');
    divLoss.id = `${target.id}-${this.plotLosses.id}`;
    divLoss.classList.add('card', 'flex-none', 'xl:flex-1', 'w-full', 'xl:w-auto');
    const divAcc = document.createElement('div');
    divAcc.id = `${target.id}-${this.plotAccuracies.id}`;
    divAcc.classList.add('card', 'flex-none', 'xl:flex-1', 'w-full', 'xl:w-auto');
    target.appendChild(divLoss);
    target.appendChild(divAcc);
    this.plotLosses.mount(`#${divLoss.id}`);
    this.plotAccuracies.mount(`#${divAcc.id}`);
  }

  destroy(): void {
    this.plotLosses.destroy();
    this.plotAccuracies.destroy();
  }
}
