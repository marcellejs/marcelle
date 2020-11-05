import { VisObjectDetection } from './vis-object-detection.module';
import { Stream } from '../../core/stream';
import { ObjectDetectorResults } from '../../core/object-detector';

export function visObjectDetection(
  imgStream: Stream<unknown>,
  objDectectionRes: Stream<ObjectDetectorResults>,
): VisObjectDetection {
  return new VisObjectDetection(imgStream, objDectectionRes);
}

export type { VisObjectDetection };
