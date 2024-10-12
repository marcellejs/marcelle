import { TextArea } from './text-area.component';

export function textArea(...args: ConstructorParameters<typeof TextArea>): TextArea {
  return new TextArea(...args);
}

export type { TextArea };
