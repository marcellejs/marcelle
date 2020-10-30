import { Webcam, WebcamOptions } from './webcam.module';

export function webcam(options?: WebcamOptions): Webcam {
  return new Webcam(options);
}

export type { Webcam, WebcamOptions } from './webcam.module';
