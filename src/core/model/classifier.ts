import type { Model, ModelConstructor } from './model';

export interface ClassifierResults {
  label: string;
  confidences: { [key: string]: number };
}

export function Classifier<TBase extends ModelConstructor<Model>>(Base: TBase) {
  abstract class ClassifierModel extends Base {
    readonly isClassifier = true;
    labels: string[];
  }
  return ClassifierModel;
}
