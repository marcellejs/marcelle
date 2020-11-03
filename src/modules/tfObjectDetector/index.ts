import { TfObjectDetector } from './tfObjectDetector.module';

export function tfObjectDetector(): TfObjectDetector {
  return new TfObjectDetector();
}

export type { TfObjectDetector };
