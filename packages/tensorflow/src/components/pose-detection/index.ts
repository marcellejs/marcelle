import { PoseDetection } from './pose-detection.component';

export function poseDetection(...args: ConstructorParameters<typeof PoseDetection>): PoseDetection {
  return new PoseDetection(...args);
}

export * from './pose-detection.component';
