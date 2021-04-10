import { Stream } from '../../core';
import { ImageDisplay } from './image-display.module';

export function imageDisplay(imageStream: Stream<ImageData> | Stream<ImageData[]>): ImageDisplay {
  return new ImageDisplay(imageStream);
}

export type { ImageDisplay };
