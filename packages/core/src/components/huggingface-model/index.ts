import { HuggingfaceModel } from './huggingface-model.component';

export function huggingfaceModel(...args: ConstructorParameters<typeof HuggingfaceModel>): HuggingfaceModel {
  return new HuggingfaceModel(...args);
}

export type { HuggingfaceModel };
