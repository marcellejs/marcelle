import { Component, Stream } from '../../core';
import View from './video-player.view.svelte';

export class VideoPlayer extends Component {
  title = 'Video Player';
  $src: Stream<string>;
  // $ready = new Stream(false, true);
  $paused = new Stream(true, true);
  $progress = new Stream(0, true);
  $mirror = new Stream(false, true);

  constructor(src = '') {
    super();
    this.$src = new Stream(src, true);
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
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
  }
}
