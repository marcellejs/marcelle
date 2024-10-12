import { ImageUpload } from './image-upload.component';

export function imageUpload(...args: ConstructorParameters<typeof ImageUpload>): ImageUpload {
  return new ImageUpload(...args);
}

export type { ImageUpload, ImageUploadOptions } from './image-upload.component';
