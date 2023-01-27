import { SentenceEncoder } from './sentence-encoder.component';

export function sentenceEncoder(...args: ConstructorParameters<typeof SentenceEncoder>): SentenceEncoder {
  return new SentenceEncoder(...args);
}

export type { SentenceEncoder };
