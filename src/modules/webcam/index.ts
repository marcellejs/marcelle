import { Webcam, WebcamOptions } from './webcam.module';

export { Webcam, WebcamOptions } from './webcam.module';

export function webcam(options?: WebcamOptions): Webcam {
  return new Webcam(options);
}
