import { PoseDetection, type Pose } from './pose-detection.component';

export function poseDetection(...args: ConstructorParameters<typeof PoseDetection>): PoseDetection {
  return new PoseDetection(...args);
}

export type { PoseDetection, Pose };
