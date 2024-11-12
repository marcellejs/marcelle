import { CocoSsd } from './coco-ssd.component';

export function cocoSsd(...args: ConstructorParameters<typeof CocoSsd>): CocoSsd {
  return new CocoSsd(...args);
}

export * from './coco-ssd.component';
