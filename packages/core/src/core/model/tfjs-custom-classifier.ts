import { type Tensor2D, type TensorLike, tensor, tidy, oneHot } from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-core/dist/public/chained_ops/gather';
import '@tensorflow/tfjs-core/dist/public/chained_ops/arg_max';
import '@tensorflow/tfjs-core/dist/public/chained_ops/squeeze';
import '@tensorflow/tfjs-core/dist/public/chained_ops/expand_dims';
import { type Dataset, isDataset } from '../../core/dataset';
import { Catch, TrainingError } from '../../utils/error-handling';
import { throwError } from '../../utils/error-handling';
import { TFJSCustomModel, type TFJSCustomModelOptions } from './tfjs-custom-model';
import type { ClassifierResults } from './types';
import type { Instance } from '../types';
import type { LazyIterable } from '../../utils';

export type TFJSCustomClassifierOptions = TFJSCustomModelOptions;

export interface ClassifierInstance extends Instance {
  x: TensorLike;
  y: string;
}

export abstract class TFJSCustomClassifier extends TFJSCustomModel<
  ClassifierInstance,
  ClassifierResults
> {
  title = 'TFJSCustomClassifier';

  @Catch
  async train(
    dataset: Dataset<ClassifierInstance> | LazyIterable<ClassifierInstance>,
    validationDataset?: Dataset<ClassifierInstance> | LazyIterable<ClassifierInstance>,
  ): Promise<void> {
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

    if (this.labels.length === 1) {
      throwError(new TrainingError('At least two classes are needed to train the classifier'));
      this.$training.set({
        status: 'error',
      });
      return;
    }

    const numClasses = this.labels.length;

    this.transformDataset = (ds) =>
      ds.map((instance) => ({
        xs: tensor(instance.x),
        ys: oneHot(this.labels.indexOf(instance.y), numClasses),
      }));

    super.train(dataset, validationDataset);
  }

  async predict(x: TensorLike): Promise<ClassifierResults> {
    if (!this.model) return { label: undefined, confidences: {} };
    return tidy(() => {
      const pred = this._predict(x) as Tensor2D;
      const label = this.labels[pred.argMax().arraySync() as number];
      const softmaxes = pred.arraySync();
      const confidences = softmaxes.reduce((c, y, i) => ({ ...c, [this.labels[i]]: y }), {});
      return { label, confidences };
    });
  }
}
