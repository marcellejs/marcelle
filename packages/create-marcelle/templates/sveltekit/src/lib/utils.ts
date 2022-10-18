import type { Component as MarcelleComponent } from '@marcellejs/core';

export function marcelle<T extends MarcelleComponent>(
  node: HTMLElement,
  component: T,
): {
  update?: (component: T) => void;
  destroy?: () => void;
} {
  component.mount(node);

  return {
    update(component) {
      console.log(`the value of component '${component}' has changed`);
    },

    destroy() {
      // the node has been removed from the DOM
      component.destroy();
    },
  };
}
