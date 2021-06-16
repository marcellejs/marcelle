import { ImageUpload, ImageUploadOptions } from './image-upload.component';

export function imageUpload(options: ImageUploadOptions): ImageUpload {
  return new ImageUpload(options);
}

export type { ImageUpload, ImageUploadOptions } from './image-upload.component';
