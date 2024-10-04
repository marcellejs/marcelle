import { Observable } from 'rxjs';
import { Component } from '../../core/component';
import View from './image-display.view.svelte';

export class ImageDisplay extends Component {
  title = 'image display';

  #imageStream: Observable<ImageData | ImageData[]>;

  constructor(imageStream: Observable<ImageData | ImageData[]>) {
    super();
    this.#imageStream = imageStream;
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        imageStream: this.#imageStream,
      },
    });
  }
}
