import { DetectionBoxes } from './detection-boxes.component';

export function detectionBoxes(
  ...args: ConstructorParameters<typeof DetectionBoxes>
): DetectionBoxes {
  return new DetectionBoxes(...args);
}

export * from './detection-boxes.component';
