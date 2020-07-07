import { Webcam } from './webcam.module';

export function webcam(options: Record<string, unknown>): Webcam {
  return new Webcam(options);
}
