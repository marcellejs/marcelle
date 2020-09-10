import { empty, map, awaitPromises } from '@most/core';
import {
  load as loadMobilenet,
  MobileNet,
  MobileNetVersion,
  MobileNetAlpha,
} from '@tensorflow-models/mobilenet';
import { Module } from '../../core/module';
import Component from './mobilenet.svelte';
import { Stream } from '../../core/stream';

export interface MobilenetOptions {
  input?: Stream<ImageData>;
  version?: MobileNetVersion;
  alpha?: MobileNetAlpha;
  mode?: 'string';
}

export interface MobilenetResults {
  label: string;
  confidences: { [key: string]: number };
}

export class Mobilenet extends Module {
  name = 'mobilenet';
  description = 'Mobilenet input module';

  #mobilenet: MobileNet | undefined;
  // #convert = createImageConverter();
  loading = true;
  readonly version: MobileNetVersion;
  readonly alpha: MobileNetAlpha;

  $features: Stream<number[][]>;

  constructor({ input = undefined, version = 1, alpha = 1 }: MobilenetOptions = {}) {
    super();
    if (![1, 2].includes(version)) {
      throw new Error('Mobilenet version must be 1 or 2');
    }
    if (![0.25, 0.5, 0.75, 1.0].includes(alpha)) {
      throw new Error('Mobilenet alpha must be 0.25 | 0.50 | 0.75 | 1.0');
    }
    this.version = version;
    this.alpha = alpha;
    if (input) {
      this.$features = new Stream(awaitPromises(map(this.process.bind(this), input)));
    } else {
      this.$features = new Stream(empty());
    }
    this.setup();
  }

  async setup(): Promise<Mobilenet> {
    this.#mobilenet = await loadMobilenet({
      version: this.version,
      alpha: this.alpha,
    });
    this.loading = false;
    this.start();
    this.$$.app?.$set({ loading: false });
    return this;
  }

  async process(image: ImageData): Promise<number[][]> {
    if (!this.#mobilenet) return [];
    return this.#mobilenet.infer(image, true).arraySync() as number[][];
  }

  async predict(image: ImageData): Promise<MobilenetResults> {
    if (!this.#mobilenet) {
      throw new Error('Mobilenet is not loaded');
    }
    const results = await this.#mobilenet.classify(image, 5);
    return {
      label: results[0].className,
      confidences: results.reduce((x, y) => ({ ...x, [y.className]: y.probability }), {}),
    };
  }

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
        loading: this.loading,
        version: this.version,
        alpha: this.alpha,
      },
    });
  }
}
