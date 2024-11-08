import type { TFJSModelOptions, InputTypes, OutputTypes } from './tfjs-model.component';
import { TFJSModel } from './tfjs-model.component';

export function tfjsModel<InputType extends keyof InputTypes, TaskType extends keyof OutputTypes>(
  options: TFJSModelOptions<InputType, TaskType>,
): TFJSModel<InputType, TaskType> {
  return new TFJSModel<InputType, TaskType>(options);
}

export type { TFJSModel, TFJSModelOptions };
