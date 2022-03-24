import { Text } from './text.component';

export function text(initial?: string): Text {
  return new Text(initial);
}

export type { Text };
