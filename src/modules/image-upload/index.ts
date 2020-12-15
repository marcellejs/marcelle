import { ImageUpload } from './image-upload.module';

export function imageUpload(): ImageUpload {
  return new ImageUpload();
}

export type { ImageUpload } from './image-upload.module';
