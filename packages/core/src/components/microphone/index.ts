import { Microphone } from './microphone.component';

export function microphone(...args: ConstructorParameters<typeof Microphone>): Microphone {
  return new Microphone(...args);
}

export * from './microphone.component';
