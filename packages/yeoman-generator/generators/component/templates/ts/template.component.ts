import { Component } from '<% if (!isMarcelleCore) { %>@marcellejs/core<% } else { %>../../core<% } %>';
import View from './<%= kebabName %>.view.svelte';

export interface <%= className %>Options {
  name?: string;
}

export class <%= className %> extends Component {
  title = '<%= kebabName %> [custom component 🤖]';

  options: <%= className %>Options;

  constructor(options: <%= className %>Options = {}) {
    super();
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
