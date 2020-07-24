import { Capture, CaptureOptions } from './capture.module';

export function capture(options: CaptureOptions): Capture {
  return new Capture(options);
}
