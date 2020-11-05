import { Dataset } from '../modules/dataset';
import { Model } from './model';

export interface ObjectDetectorResults {
  outputs: {
    bbox: [number, number, number, number];
    class: string;
    confidence: number;
  }[];
}

export abstract class ObjectDetector<
  InputType,
  ResultType extends ObjectDetectorResults
> extends Model<InputType, ResultType> {
  static readonly isObjectDetector = true;

  labels: string[];

  abstract train(dataset: Dataset): void;
  abstract async predict(x: InputType): Promise<ResultType>;
}
