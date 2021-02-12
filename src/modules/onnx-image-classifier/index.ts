import { OnnxImageClassifier, OnnxImageClassifierOptions } from './onnx-image-classifier.module';

export function onnxImageClassifier(options: OnnxImageClassifierOptions): OnnxImageClassifier {
  return new OnnxImageClassifier(options);
}

export type { OnnxImageClassifier, OnnxImageClassifierOptions };
