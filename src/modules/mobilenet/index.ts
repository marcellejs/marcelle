import { Mobilenet, MobilenetOptions } from './mobilenet.module';

export function mobilenet(options?: MobilenetOptions): Mobilenet {
  return new Mobilenet(options);
}

export type { Mobilenet, MobilenetOptions };
