import { throwError } from '@marcellejs/core';
import { TextInput } from './text-input.component';

export function textInput(...args: ConstructorParameters<typeof TextInput>): TextInput {
  return new TextInput(...args);
}

/** @deprecated */
export function textField(): TextInput {
  const e = new Error('textField has been renamed to textInput');
  e.name = 'Deprecation Notice';
  throwError(e);
  return textInput();
}

export type { TextInput };
