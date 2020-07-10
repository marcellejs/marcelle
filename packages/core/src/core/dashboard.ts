import { Module } from './module';

export class Dashboard {
  modules: Module[] = [];
  modulesLeft: Module[] = [];

  constructor(public name: string) {}

  use(...modules: [Module]): Dashboard {
    this.modules = this.modules.concat(modules);
    return this;
  }

  useLeft(...modules: [Module]): Dashboard {
    this.modulesLeft = this.modulesLeft.concat(modules);
    return this;
  }

  mount(): void {
    this.modules.forEach((m) => m.mount());
    this.modulesLeft.forEach((m) => m.mount());
  }

  destroy(): void {
    this.modules.forEach((m) => m.destroy());
    this.modulesLeft.forEach((m) => m.destroy());
  }
}
