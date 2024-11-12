import { MediaRecorder } from './media-recorder.component';
export type { MediaRecording } from './media-recorder.component';

export function mediaRecorder(...args: ConstructorParameters<typeof MediaRecorder>): MediaRecorder {
  return new MediaRecorder(...args);
}

export * from './media-recorder.component';
