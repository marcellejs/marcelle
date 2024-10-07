import { Observable } from 'rxjs';
import { Component } from '../../core/component';
import View from './progress-bar.view.svelte';

export interface ProgressType {
  message: string;
  progress: number;
  type: 'default' | 'idle' | 'success' | 'danger';
}

export class ProgressBar extends Component {
  title = 'progress bar';

  constructor(public $progress: Observable<ProgressType>) {
    super();
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        progress: this.$progress,
      },
    });
  }
}
