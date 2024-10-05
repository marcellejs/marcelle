import { BehaviorSubject } from 'rxjs';
import { Component } from '../../core/component';
import View from './media-recorder.view.svelte';

export interface MediaRecording {
  duration: number;
  blob: Blob;
  type: string;
  thumbnail: string;
}

export class MediaRecorder extends Component {
  title = 'Media Recorder';

  $mediaStream: BehaviorSubject<MediaStream>;
  $active = new BehaviorSubject(false);
  $recordings = new BehaviorSubject<MediaRecording>(undefined);

  constructor(mediaStream: MediaStream) {
    super();
    this.$mediaStream = new BehaviorSubject(mediaStream);
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
