import { Module } from '../core/module';

export class Step {
  modules: Array<Module | Module[] | string> = [];

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

  use(...modules: Array<Module | Module[] | string>): Step {
    this.modules = this.modules.concat(modules);
    return this;
  }

  step(): Step {
    return this.stepFn();
  }
}
