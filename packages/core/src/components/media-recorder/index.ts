import { MediaRecorder } from './media-recorder.component';

export function mediaRecorder(...args: ConstructorParameters<typeof MediaRecorder>): MediaRecorder {
  return new MediaRecorder(...args);
}

export type { MediaRecorder };
