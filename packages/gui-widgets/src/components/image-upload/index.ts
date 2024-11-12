import { ImageUpload } from './image-upload.component';

export function imageUpload(...args: ConstructorParameters<typeof ImageUpload>): ImageUpload {
  return new ImageUpload(...args);
}

export * from './image-upload.component';
