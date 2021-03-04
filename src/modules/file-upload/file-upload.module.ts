import { never } from '@most/core';
import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import Component from './file-upload.svelte';

export class FileUpload extends Module {
  title = 'file upload';

  $files = new Stream(never());

  constructor() {
    super();
    this.start();
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new Component({
      target: t,
      props: {
        title: this.title,
        fileStream: this.$files,
      },
    });
  }
}
