import { Component } from '<% if (!isMarcelleCore) { %>@marcellejs/core<% } else { %>../../core<% } %>';
import View from './<%= kebabName %>.view.svelte';

export class <%= className %> extends Component {
  constructor(options) {
    super();
    this.title = '<%= kebabName %> [custom component 🤖]';
    this.options = options;
  }

  mount(target) {
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
