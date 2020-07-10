import {
  load as loadMobilenet,
  MobileNet,
  MobileNetVersion,
  MobileNetAlpha,
} from '@tensorflow-models/mobilenet';
import { Writable, Readable } from 'svelte/store';
import { Module } from '../../core/module';
import { createStore } from './mobilenet.store';
import component from './mobilenet.svelte';

export interface MobilenetOptions {
  input?: Writable<string> | Readable<string>;
  version?: MobileNetVersion;
  alpha?: MobileNetAlpha;
}

function createImageConverter() {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const image = new Image();
  return function convertURIToImageData(URI: string): Promise<ImageData> {
    return new Promise(function (resolve, reject) {
      if (!URI) return reject();
      image.addEventListener(
        'load',
        () => {
          canvas.width = image.width;
          canvas.height = image.height;
          context?.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(context?.getImageData(0, 0, canvas.width, canvas.height));
        },
        false,
      );
      image.src = URI;
    });
  };
}

export class Mobilenet extends Module {
  name = 'mobilenet';
  description = 'Mobilenet input module';
  component = component;
  store = createStore();
  mobilenet: MobileNet | undefined;
  private convert = createImageConverter();

  constructor({ input = undefined, version = 1, alpha = 1 }: MobilenetOptions = {}) {
    super();
    if (input) input.subscribe(this.process.bind(this));
    this.out.features = this.store.features;
    this.setup(version, alpha);
  }

  async setup(version: MobileNetVersion, alpha: MobileNetAlpha): Promise<Mobilenet> {
    this.mobilenet = await loadMobilenet({
      version,
      alpha,
    });
    return this;
  }

  async process(
    image: string,
  ): Promise<
    | number
    | number[]
    | number[][]
    | number[][][]
    | number[][][][]
    | number[][][][][]
    | number[][][][][][]
  > {
    if (!this.mobilenet) return [];
    return this.mobilenet.infer(await this.convert(image), true).arraySync();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  mount(): void {}
}
