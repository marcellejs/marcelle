import {
  load as loadMobilenet,
  MobileNet,
  MobileNetVersion,
  MobileNetAlpha,
} from '@tensorflow-models/mobilenet';
import { GraphModel } from '@tensorflow/tfjs-converter';
import { io, tidy } from '@tensorflow/tfjs-core';
import { Classifier, logger, Model, ModelConstructor } from '../../core';
import { Stream } from '../../core/stream';
import { Catch, TrainingError } from '../../utils/error-handling';
import Component from './mobilenet.svelte';

export interface MobilenetOptions {
  version?: MobileNetVersion;
  alpha?: MobileNetAlpha;
}

export interface MobilenetResults {
  label: string;
  confidences: { [key: string]: number };
}

export class Mobilenet extends Classifier(Model as ModelConstructor<Model>) {
  name = 'mobilenet';

  parameters = {};

  #mobilenet: (MobileNet & { model?: GraphModel }) | undefined;
  $loading = new Stream(true, true);
  readonly version: MobileNetVersion;
  readonly alpha: MobileNetAlpha;

  constructor({ version = 1, alpha = 1 }: MobilenetOptions = {}) {
    super();
    if (![1, 2].includes(version)) {
      throw new Error('Mobilenet version must be 1 or 2');
    }
    if (![0.25, 0.5, 0.75, 1.0].includes(alpha)) {
      throw new Error('Mobilenet alpha must be 0.25 | 0.50 | 0.75 | 1.0');
    }
    this.version = version;
    this.alpha = alpha;
    this.setup();
  }

  async setup(): Promise<Mobilenet> {
    const cachedModels = await io.listModels();
    const cachedMobilenet = Object.keys(cachedModels).filter((x) => x.includes('mobilenet'));
    try {
      this.#mobilenet = await loadMobilenet({
        modelUrl: `indexeddb://mobilenet-v${this.version}-${this.alpha}`,
        version: this.version,
        alpha: this.alpha,
      });
    } catch (error) {
      if (cachedMobilenet.length > 0) {
        await io.removeModel(cachedMobilenet[0]);
      }
      this.#mobilenet = await loadMobilenet({
        version: this.version,
        alpha: this.alpha,
      });
      await this.#mobilenet.model.save(`indexeddb://mobilenet-v${this.version}-${this.alpha}`);
    }
    logger.info(`Mobilenet v${this.version} loaded with alpha = ${this.alpha}`);
    this.$loading.set(false);
    this.start();
    return this;
  }

  async process(image: ImageData): Promise<number[][]> {
    if (!this.#mobilenet) return [];
    return tidy(() => {
      const x = this.#mobilenet.infer(image, true).arraySync() as number[][];
      return x;
    });
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
        loading: this.$loading,
        version: this.version,
        alpha: this.alpha,
      },
    });
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  train(): never {
    throw new TrainingError('Model `CocoSsd` cannot be trained');
  }
}
