import { Text, TextOptions } from './text.component';

export function text(options: Partial<TextOptions>): Text {
  return new Text(options);
}

export type { Text, TextOptions };
