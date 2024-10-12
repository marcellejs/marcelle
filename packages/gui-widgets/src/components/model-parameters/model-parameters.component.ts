import { Component, type Parametrable } from '@marcellejs/core';
import View from './model-parameters.view.svelte';

type WidgetType = 'menu' | 'text' | 'boolean' | 'number' | 'number array' | 'auto';
export type ParamConfig = Record<string, { type: WidgetType | 'auto'; options?: string[] }>;

export class ModelParameters extends Component {
  title = 'modelParameters';

  #component: Parametrable;
  config: ParamConfig;

  constructor(m: Parametrable, config: ParamConfig = {}) {
    super();
    this.#component = m;
    this.config = config;
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        parameters: this.#component.parameters,
        config: this.config,
      },
    });
  }
}
