import { Stream } from '../../core/stream';
import { Component } from '../../core/component';
import View from './microphone.view.svelte';
import { throwError } from '../../utils';

export class Microphone extends Component {
  title: string;

  $active = new Stream(false, true);
  $ready = new Stream(false, true);
  $mediastream = new Stream<MediaStream>(undefined, true);

  constructor() {
    super();
    this.title = 'Microphone';
    this.$active.subscribe((active) => {
      if (active) {
        this.loadMicrophone();
      } else {
        if (this.$mediastream.get()) {
          const tracks = this.$mediastream.get().getTracks();
          for (const track of tracks) {
            track.stop();
          }

          this.$ready.set(false);
        }
      }
    });
    this.start();
  }

  async loadMicrophone(): Promise<void> {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      this.$mediastream.set(mediaStream);
      this.$ready.set(true);
    } catch (error) {
      throwError(new Error('Webcam not supported'));
    }
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        active: this.$active,
        mediaStream: this.$mediastream,
      },
    });
  }
}
