import { Component } from '../../core/component';
import View from './microphone.view.svelte';
import { throwError } from '../../utils';
import { BehaviorSubject } from 'rxjs';
import { mount, unmount } from 'svelte';

export class Microphone extends Component {
  title: string;

  $active = new BehaviorSubject(false);
  $ready = new BehaviorSubject(false);
  $mediastream = new BehaviorSubject<MediaStream>(undefined);

  constructor() {
    super();
    this.title = 'Microphone';
    this.$active.subscribe((active) => {
      if (active) {
        this.loadMicrophone();
      } else {
        if (this.$mediastream.getValue()) {
          const tracks = this.$mediastream.getValue().getTracks();
          for (const track of tracks) {
            track.stop();
          }

          this.$ready.next(false);
        }
      }
    });
  }

  async loadMicrophone(): Promise<void> {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      this.$mediastream.next(mediaStream);
      this.$ready.next(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throwError(new Error('Webcam not supported'));
    }
  }

  mount(target?: HTMLElement) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    const app = mount(View, {
      target: t,
      props: {
        active: this.$active,
        mediaStream: this.$mediastream,
      },
    });
    return () => unmount(app);
  }
}
