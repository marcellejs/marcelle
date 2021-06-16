import { Slider, SliderOptions } from './slider.component';

export function slider(options: Partial<SliderOptions>): Slider {
  return new Slider(options);
}

export type { Slider, SliderOptions };
