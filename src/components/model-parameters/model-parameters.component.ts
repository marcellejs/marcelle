import { Component } from '../../core/component';
import { Parametrable } from '../../core/types';
import View from './model-parameters.view.svelte';

export class ModelParameters extends Component {
  title = 'modelParameters';

  #component: Parametrable;

  constructor(m: Parametrable) {
    super();
    this.#component = m;
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        parameters: this.#component.parameters,
      },
    });
  }
}
