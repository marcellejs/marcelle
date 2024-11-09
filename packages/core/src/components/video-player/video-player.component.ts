import { BehaviorSubject } from 'rxjs';
import { Component } from '../../core';
import View from './video-player.view.svelte';
import { mount, unmount } from 'svelte';

export class VideoPlayer extends Component {
  title = 'Video Player';
  $src: BehaviorSubject<string | MediaStream>;
  $paused = new BehaviorSubject(true);
  $progress = new BehaviorSubject(0);
  $mirror = new BehaviorSubject(false);

  constructor(src = '') {
    super();
    this.$src = new BehaviorSubject<string | MediaStream>(src);
  }

  mount(target?: HTMLElement) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    const app = mount(View, {
      target: t,
      props: {
        title: this.title,
        src: this.$src,
        // ready: this.$ready,
        paused: this.$paused,
        progress: this.$progress,
        mirror: this.$mirror,
      },
    });
    return () => unmount(app);
  }
}
