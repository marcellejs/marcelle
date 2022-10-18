import { Slider } from './slider.component';

export function slider(...args: ConstructorParameters<typeof Slider>): Slider {
  return new Slider(...args);
}

export type { Slider };
