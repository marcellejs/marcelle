import type { Stream, ObjectDetectorResults } from '../../core';
import { DetectionBoxes } from './detection-boxes.component';

export function detectionBoxes(
  imgStream: Stream<ImageData>,
  objDectectionRes: Stream<ObjectDetectorResults>,
): DetectionBoxes {
  return new DetectionBoxes(imgStream, objDectectionRes);
}

export type { DetectionBoxes };
