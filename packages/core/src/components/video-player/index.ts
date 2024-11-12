import { VideoPlayer } from './video-player.component';

export function videoPlayer(...args: ConstructorParameters<typeof VideoPlayer>): VideoPlayer {
  return new VideoPlayer(...args);
}

export * from './video-player.component';
