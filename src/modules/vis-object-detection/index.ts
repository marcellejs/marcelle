import { VisObjectDetection } from './visObjectDetection.module';
import { Stream } from '../../core/stream';
import { ObjectDetectorResults } from '../../core/objectDetector';

export function visObjectDetection(
  imgStream: Stream<unknown>,
  objDectectionRes: Stream<ObjectDetectorResults>,
): VisObjectDetection {
  return new VisObjectDetection(imgStream, objDectectionRes);
}

export type { VisObjectDetection };
