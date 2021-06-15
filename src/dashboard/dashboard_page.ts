import { Component } from '../core/component';

function isTitle(x: Component | Component[] | string): x is string {
  return typeof x === 'string';
}

function isComponentArray(x: Component | Component[] | string): x is Component[] {
  return Array.isArray(x);
}

export class DashboardPage {
  components: Array<Component | Component[] | string> = [];
  componentsLeft: Component[] = [];

  constructor(public name: string, public showSidebar = true) {}

  use(...components: Array<Component | Component[] | string>): DashboardPage {
    this.components = this.components.concat(components);
    return this;
  }

  useLeft(...components: Component[]): DashboardPage {
    this.componentsLeft = this.componentsLeft.concat(components);
    return this;
  }

  mount(): void {
    for (const m of this.components) {
      if (isComponentArray(m)) {
        for (const n of m) {
          n.mount();
        }
      } else if (!isTitle(m)) {
        m.mount();
      }
    }
    for (const m of this.componentsLeft) {
      m.mount();
    }
  }

  destroy(): void {
    for (const m of this.components) {
      if (isComponentArray(m)) {
        for (const n of m) {
          n.destroy();
        }
      } else if (!isTitle(m)) {
        m.destroy();
      }
    }
    for (const m of this.componentsLeft) {
      m.destroy();
    }
  }
}
