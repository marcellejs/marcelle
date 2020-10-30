import { ImageDrop } from './image-drop.module';

export type { ImageDrop } from './image-drop.module';

export function imageDrop(): ImageDrop {
  return new ImageDrop();
}
