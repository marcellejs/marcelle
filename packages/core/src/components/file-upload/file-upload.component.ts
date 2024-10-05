import { Component } from '../../core/component';
import View from './file-upload.view.svelte';
import { Subject } from 'rxjs';

export class FileUpload extends Component {
  title = 'file upload';

  $files = new Subject<File[]>();

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
