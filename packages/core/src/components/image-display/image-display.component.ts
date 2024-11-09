import { Observable } from 'rxjs';
import { Component } from '../../core/component';
import View from './image-display.view.svelte';
import { mount, unmount } from 'svelte';

export class ImageDisplay extends Component {
  title = 'image display';

  #imageStream: Observable<ImageData | ImageData[]>;

  constructor(imageStream: Observable<ImageData | ImageData[]>) {
    super();
    this.#imageStream = imageStream;
  }

  mount(target?: HTMLElement) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    const app = mount(View, {
      target: t,
      props: {
        imageStream: this.#imageStream,
      },
    });
    return () => unmount(app);
  }
}
