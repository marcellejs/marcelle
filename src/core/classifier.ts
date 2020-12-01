import { Dataset } from '../modules/dataset';
import { Model } from './model';

export interface ClassifierResults {
  label: string;
  confidences: { [key: string]: number };
}

export abstract class Classifier<InputType, ResultType extends ClassifierResults> extends Model<
  InputType, // eslint-disable-line @typescript-eslint/indent
  ResultType // eslint-disable-line @typescript-eslint/indent
> {
  static readonly isClassifier = true;

  labels: string[];

  abstract train(dataset: Dataset): void;
  abstract predict(x: InputType): Promise<ResultType>;
}
