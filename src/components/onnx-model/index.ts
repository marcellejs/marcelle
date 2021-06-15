import { OnnxModel, OnnxModelOptions } from './onnx-model.component';

export function onnxModel(options: OnnxModelOptions): OnnxModel {
  return new OnnxModel(options);
}

export type { OnnxModel, OnnxModelOptions };
