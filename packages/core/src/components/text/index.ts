import { Text } from './text.component';

export function text(...args: ConstructorParameters<typeof Text>): Text {
  return new Text(...args);
}

export type { Text };
