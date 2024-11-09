import type { Component as MarcelleComponent } from '@marcellejs/core';

export function marcelle<T extends MarcelleComponent>(node: HTMLElement, component: T) {
  $effect(() => component.mount(node));
}
