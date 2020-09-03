import { Module } from '../core/module';

function isTitle(x: Module | Module[] | string): x is string {
  return typeof x === 'string';
}

function isModuleArray(x: Module | Module[] | string): x is Module[] {
  return Array.isArray(x);
}

export class DashboardPage {
  modules: Array<Module | Module[] | string> = [];
  modulesLeft: Module[] = [];

  constructor(public name: string) {}

  use(...modules: Array<Module | Module[] | string>): DashboardPage {
    this.modules = this.modules.concat(modules);
    return this;
  }

  useLeft(...modules: Module[]): DashboardPage {
    this.modulesLeft = this.modulesLeft.concat(modules);
    return this;
  }

  mount(): void {
    this.modules.forEach((m) => {
      if (isModuleArray(m)) {
        m.forEach((n) => n.mount());
      } else if (!isTitle(m)) {
        m.mount();
      }
    });
    this.modulesLeft.forEach((m) => m.mount());
  }

  destroy(): void {
    this.modules.forEach((m) => {
      if (isModuleArray(m)) {
        m.forEach((n) => n.destroy());
      } else if (!isTitle(m)) {
        m.destroy();
      }
    });
    // this.modules.forEach((m) => m.destroy());
    this.modulesLeft.forEach((m) => m.destroy());
  }
}
