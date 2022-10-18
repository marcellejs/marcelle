import { SketchPad } from './sketch-pad.component';

export function sketchPad(...args: ConstructorParameters<typeof SketchPad>): SketchPad {
  return new SketchPad(...args);
}

export type { SketchPad };
