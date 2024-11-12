import { Webcam } from './webcam.component';

export function webcam(...args: ConstructorParameters<typeof Webcam>): Webcam {
  return new Webcam(...args);
}

export * from './webcam.component';
