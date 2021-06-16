import { DetectionBoxes } from './detection-boxes.component';
import { Stream, ObjectDetectorResults } from '../../core';

export function detectionBoxes(
  imgStream: Stream<ImageData>,
  objDectectionRes: Stream<ObjectDetectorResults>,
): DetectionBoxes {
  return new DetectionBoxes(imgStream, objDectectionRes);
}

export type { DetectionBoxes };
