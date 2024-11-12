import { Component } from '@marcellejs/core';
import View from './file-upload.view.svelte';
import { Subject } from 'rxjs';
import { mount, unmount } from 'svelte';

export class FileUpload extends Component {
  title = 'file upload';

  $files = new Subject<File[]>();

  mount(target?: HTMLElement) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    const app = mount(View, {
      target: t,
      props: {
        fileStream: this.$files,
      },
    });
    return () => unmount(app);
  }
}
