import {
  TFJSGenericModel,
  TFJSGenericModelOptions,
  InputTypes,
  OutputTypes,
} from './tf-generic-model.module';

export function tfGenericModel<
  InputType extends keyof InputTypes,
  TaskType extends keyof OutputTypes
>(options: TFJSGenericModelOptions<InputType, TaskType>): TFJSGenericModel<InputType, TaskType> {
  return new TFJSGenericModel<InputType, TaskType>(options);
}

export type { TFJSGenericModel, TFJSGenericModelOptions };
