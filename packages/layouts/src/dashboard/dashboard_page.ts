import type { Component } from '@marcellejs/core';

function isTitle(x: Component | Component[] | string): x is string {
  return typeof x === 'string';
}

function isComponentArray(x: Component | Component[] | string): x is Component[] {
  return Array.isArray(x);
}

export class DashboardPage {
  components: Array<Component | Component[] | string> = [];
  componentsLeft: Component[] = [];
  unmount: Array<() => void> = [];

  constructor(
    public name: string,
    public showSidebar = true,
  ) {}

  use(...components: Array<Component | Component[] | string>): DashboardPage {
    this.components = this.components.concat(components);
    return this;
  }

  sidebar(...components: Component[]): DashboardPage {
    this.componentsLeft = this.componentsLeft.concat(components);
    return this;
  }

  mount(): void {
    this.unmount = [];
    for (const m of this.components) {
      if (isComponentArray(m)) {
        for (const n of m) {
          this.unmount.push(n.mount());
        }
      } else if (!isTitle(m)) {
        this.unmount.push(m.mount());
      }
    }
    for (const m of this.componentsLeft) {
      this.unmount.push(m.mount());
    }
  }

  destroy(): void {
    for (const f of this.unmount) {
      f();
    }
  }
}
