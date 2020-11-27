import { Module } from '../core/module';

export class WizardStep {
  modules: Array<Module | Module[]> = [];

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

  use(...modules: Array<Module | Module[]>): WizardStep {
    this.modules = this.modules.concat(modules);
    return this;
  }

  step(): WizardStep {
    return this.stepFn();
  }
}
