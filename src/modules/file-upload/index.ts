import { FileUpload } from './file-upload.module';

export type { FileUpload } from './file-upload.module';

export function fileUpload(): FileUpload {
  return new FileUpload();
}
