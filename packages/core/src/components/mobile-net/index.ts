import { MobileNet } from './mobile-net.component';

export function mobileNet(...args: ConstructorParameters<typeof MobileNet>): MobileNet {
  return new MobileNet(...args);
}

export type { MobileNet };
