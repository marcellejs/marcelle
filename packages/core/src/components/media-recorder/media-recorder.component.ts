import { Component } from '../../core/component';
import { Stream } from '../../core/stream';
import View from './media-recorder.view.svelte';

export class MediaRecorder extends Component {
  title = 'Media Recorder';

  $mediaStream: Stream<MediaStream>;
  $active = new Stream(false, true);
  $recordings: Stream<{
    duration: number;
    blob: Blob;
    type: string;
    thumbnail: string;
  }> = new Stream(undefined).skip(1);

  constructor(mediaStream: MediaStream) {
    super();
    this.$mediaStream = new Stream(mediaStream, true);
    this.start();
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        mediaStream: this.$mediaStream,
        active: this.$active,
        recordings: this.$recordings,
      },
    });
  }
}
