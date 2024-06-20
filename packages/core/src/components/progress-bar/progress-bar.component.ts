import type { Stream } from '../../core/stream';
import { Component } from '../../core/component';
import View from './progress-bar.view.svelte';

export interface ProgressType {
  message: string;
  progress: number;
  type: 'default' | 'idle' | 'success' | 'danger';
}

export class ProgressBar extends Component {
  title = 'progress bar';

  constructor(public $progress: Stream<ProgressType>) {
    super();
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
        progress: this.$progress,
      },
    });
  }
}
