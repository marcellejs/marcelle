import { TFJSModel, TFJSModelOptions, InputTypes, OutputTypes } from './tfjs-model.module';

export function tfjsModel<InputType extends keyof InputTypes, TaskType extends keyof OutputTypes>(
  options: TFJSModelOptions<InputType, TaskType>,
): TFJSModel<InputType, TaskType> {
  return new TFJSModel<InputType, TaskType>(options);
}

export type { TFJSModel, TFJSModelOptions };
