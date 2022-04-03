import { throwError } from '../../utils/error-handling';
import { TextInput } from './text-input.component';

export function textInput(defaultValue?: string): TextInput {
  return new TextInput(defaultValue);
}

/** @deprecated */
export function textField(): TextInput {
  const e = new Error('textField has been renamed to textInput');
  e.name = 'Deprecation Notice';
  throwError(e);
  return textInput();
}

export type { TextInput };
