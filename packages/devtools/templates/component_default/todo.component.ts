import { Component } from '@marcellejs/core';
import View from './todo.view.svelte';

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

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        options: this.options,
      },
    });
  }
}
