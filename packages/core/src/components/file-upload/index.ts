import { FileUpload } from './file-upload.component';

export function fileUpload(...args: ConstructorParameters<typeof FileUpload>): FileUpload {
  return new FileUpload(...args);
}

export type { FileUpload } from './file-upload.component';
