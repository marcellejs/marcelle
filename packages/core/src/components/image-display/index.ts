import { ImageDisplay } from './image-display.component';

export function imageDisplay(...args: ConstructorParameters<typeof ImageDisplay>): ImageDisplay {
  return new ImageDisplay(...args);
}

export * from './image-display.component';
