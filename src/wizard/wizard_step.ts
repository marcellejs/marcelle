import { Module } from '../core/module';

export class Step {
  modules: Module[] = [];

  attr = { title: '', description: '' };

  constructor(public stepFn: () => Step) {}

  title(title: string): Step {
    this.attr.title = title;
    return this;
  }

  description(desc: string): Step {
    this.attr.description = desc;
    return this;
  }

  use(...modules: Module[]): Step {
    this.modules = this.modules.concat(modules);
    return this;
  }

  step(): Step {
    return this.stepFn();
  }
}
