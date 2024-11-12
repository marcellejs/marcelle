import { Component } from '@marcellejs/core';
import View from './todo.view.svelte';
import { mount, unmount } from 'svelte';

export interface TodoOptions {
  [key: string]: unknown;
}

export class Todo extends Component {
  title: string;
  options: TodoOptions;

  constructor(options: TodoOptions = {}) {
    super();
    this.title = 'todo [custom component 🤖]';
    this.options = options;
  }

  mount(target?: HTMLElement) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    const app = mount(View, {
      target: t,
      props: {
        title: this.title,
        options: this.options,
      },
    });
    return () => unmount(app);
  }
}
