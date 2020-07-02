import { Module } from './module';
import component from './Webcam.vue';
import Vue from 'vue';

class Webcam extends Module {
  name = 'webcam';
  description = 'Webcam input module';
  component = Vue.extend(component);
  watchers = ['active'];

  constructor(options: Record<string, unknown>) {
    super(options);
    this.setup();
  }
}
export function webcam(options: Record<string, unknown>): Webcam {
  return new Webcam(options);
}
