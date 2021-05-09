import { MobileNet, MobileNetOptions } from './mobile-net.module';

export function mobileNet(options?: MobileNetOptions): MobileNet {
  return new MobileNet(options);
}

export type { MobileNet, MobileNetOptions };
