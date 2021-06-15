import { Component } from '../core/component';

export class WizardStep {
  components: Array<Component | Component[]> = [];

  attr = { title: '', description: '' };

  constructor(public stepFn: () => WizardStep) {}

  title(title: string): WizardStep {
    this.attr.title = title;
    return this;
  }

  description(desc: string): WizardStep {
    this.attr.description = desc;
    return this;
  }

  use(...components: Array<Component | Component[]>): WizardStep {
    this.components = this.components.concat(components);
    return this;
  }

  step(): WizardStep {
    return this.stepFn();
  }
}
