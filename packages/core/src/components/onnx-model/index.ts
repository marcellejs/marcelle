import type { InputTypes, OutputTypes, ONNXModelOptions } from './onnx-model.component';
import { OnnxModel } from './onnx-model.component';

export function onnxModel<InputType extends keyof InputTypes, TaskType extends keyof OutputTypes>(
  options: ONNXModelOptions<InputType, TaskType>,
): OnnxModel<InputType, TaskType> {
  return new OnnxModel<InputType, TaskType>(options);
}

export type { OnnxModel, ONNXModelOptions };
