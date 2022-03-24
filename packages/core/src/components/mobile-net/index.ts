import { MobileNet, MobileNetOptions } from './mobile-net.component';

export function mobileNet(options?: MobileNetOptions): MobileNet {
  return new MobileNet(options);
}

export type { MobileNet, MobileNetOptions };
