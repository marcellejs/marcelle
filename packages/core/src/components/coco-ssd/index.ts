import { CocoSsd } from './coco-ssd.component';

export function cocoSsd(...args: ConstructorParameters<typeof CocoSsd>): CocoSsd {
  return new CocoSsd(...args);
}

export type { CocoSsd };
