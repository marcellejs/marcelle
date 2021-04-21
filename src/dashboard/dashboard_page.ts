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

  constructor(public name: string, public showSidebar = true) {}

  use(...modules: Array<Module | Module[] | string>): DashboardPage {
    this.modules = this.modules.concat(modules);
    return this;
  }

  useLeft(...modules: Module[]): DashboardPage {
    this.modulesLeft = this.modulesLeft.concat(modules);
    return this;
  }

  mount(): void {
    for (const m of this.modules) {
      if (isModuleArray(m)) {
        for (const n of m) {
          n.mount();
        }
      } else if (!isTitle(m)) {
        m.mount();
      }
    }
    for (const m of this.modulesLeft) {
      m.mount();
    }
  }

  destroy(): void {
    for (const m of this.modules) {
      if (isModuleArray(m)) {
        for (const n of m) {
          n.destroy();
        }
      } else if (!isTitle(m)) {
        m.destroy();
      }
    }
    for (const m of this.modulesLeft) {
      m.destroy();
    }
  }
}
