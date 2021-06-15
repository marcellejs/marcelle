import { Component } from '../../core/component';

export class WizardPage {
  components: Array<Component | Component[]> = [];

  attr = { title: '', description: '' };

  constructor(public pageFn: () => WizardPage) {}

  title(title: string): WizardPage {
    this.attr.title = title;
    return this;
  }

  description(desc: string): WizardPage {
    this.attr.description = desc;
    return this;
  }

  use(...components: Array<Component | Component[]>): WizardPage {
    this.components = this.components.concat(components);
    return this;
  }

  page(): WizardPage {
    return this.pageFn();
  }
}
