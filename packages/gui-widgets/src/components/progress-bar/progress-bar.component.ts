import { Observable } from 'rxjs';
import { Component } from '@marcellejs/core';
import View from './progress-bar.view.svelte';
import { mount, unmount } from 'svelte';

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

  mount(target?: HTMLElement) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    const app = mount(View, {
      target: t,
      props: {
        progress: this.$progress,
      },
    });
    return () => unmount(app);
  }
}
