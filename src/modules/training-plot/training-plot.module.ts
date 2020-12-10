import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import { MLP } from '../mlp';
import { chart, Chart } from '../chart';
import Component from './training-plot.svelte';
import { throwError } from '../../utils/error-handling';

export class TrainingPlot extends Module {
  title = 'training plot';

  plotLosses: Chart;
  plotAccuracies: Chart;

  constructor(public model: MLP) {
    super();
    if (!model) {
      const e = new Error('[training plot] No model was provided');
      e.name = 'Module Compatibility Error';
      throwError(e);
    }
    if (!model.$training) {
      const e = new Error(
        '[training plot] The provided model is incompatible with the training plot module, missing `$training` stream',
      );
      e.name = 'Module Compatibility Error';
      throwError(e);
    }
    const trainingLoss = new Stream([], true);
    const validationLoss = new Stream([], true);
    this.plotLosses = chart({
      preset: 'line-fast',
      options: {
        xlabel: 'Epoch',
        ylabel: 'Loss',
      },
    });
    this.plotLosses.addSeries(trainingLoss, 'training loss');
    this.plotLosses.addSeries(validationLoss, 'validation loss');
    this.plotLosses.title = 'losses';

    const trainingAccuracy = new Stream([], true);
    const validationAccuracy = new Stream([], true);
    this.plotAccuracies = chart({
      preset: 'line-fast',
      options: {
        xlabel: 'Epoch',
        ylabel: 'Accuracy',
        scales: { y: { suggestedMax: 1 } },
      },
    });
    this.plotAccuracies.addSeries(trainingAccuracy, 'training accuracy');
    this.plotAccuracies.addSeries(validationAccuracy, 'validation accuracy');
    this.plotAccuracies.title = 'accuracies';

    model.$training.subscribe((x) => {
      if (x.status === 'start') {
        trainingLoss.set([]);
        validationLoss.set([]);
        trainingAccuracy.set([]);
        validationAccuracy.set([]);
      } else if (x.status === 'epoch') {
        if (x.data) {
          trainingLoss.set(trainingLoss.value.concat([x.data.loss]));
          validationLoss.set(validationLoss.value.concat([x.data.lossVal]));
          trainingAccuracy.set(trainingAccuracy.value.concat([x.data.accuracy]));
          validationAccuracy.set(validationAccuracy.value.concat([x.data.accuracyVal]));
        }
      }
    });
    this.start();
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new Component({
      target: t,
      props: {
        plotLosses: this.plotLosses,
        plotAccuracies: this.plotAccuracies,
      },
    });
  }
}
