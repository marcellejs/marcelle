import { never } from '@most/core';
import { Component } from '../../core/component';
import { Stream } from '../../core/stream';
import View from './file-upload.view.svelte';

export class FileUpload extends Component {
  title = 'file upload';

  $files = new Stream<File[]>(never());

  constructor() {
    super();
    this.start();
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        fileStream: this.$files,
      },
    });
  }
}
