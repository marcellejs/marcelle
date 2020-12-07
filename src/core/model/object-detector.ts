import type { Model, ModelConstructor } from './model';

export interface ObjectDetectorResults {
  outputs: {
    bbox: [number, number, number, number];
    class: string;
    confidence: number;
  }[];
}

export function ObjectDetector<TBase extends ModelConstructor<Model>>(Base: TBase) {
  abstract class ObjectDetectorModel extends Base {
    readonly isObjectDetector = true;
    labels: string[];
  }
  return ObjectDetectorModel;
}
