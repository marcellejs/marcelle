import {
  load as loadMobilenet,
  MobileNet as TfjsMobilleNet,
  MobileNetVersion,
  MobileNetAlpha,
} from '@tensorflow-models/mobilenet';
import { GraphModel } from '@tensorflow/tfjs-converter';
import { io, tidy } from '@tensorflow/tfjs-core';
import { ClassifierResults, logger, Model } from '../../core';
import { Stream } from '../../core/stream';
import { Catch, TrainingError } from '../../utils/error-handling';
import Component from './mobile-net.svelte';

export interface MobileNetOptions {
  version?: MobileNetVersion;
  alpha?: MobileNetAlpha;
}

export interface MobileNetResults {
  label: string;
  confidences: { [key: string]: number };
}

export class MobileNet extends Model<ImageData, ClassifierResults> {
  title = 'mobileNet';

  parameters = {};
  serviceName = 'undefined';

  #mobilenet: (TfjsMobilleNet & { model?: GraphModel }) | undefined;
  $loading = new Stream(true, true);
  readonly version: MobileNetVersion;
  readonly alpha: MobileNetAlpha;

  constructor({ version = 1, alpha = 1 }: MobileNetOptions = {}) {
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

  async setup(): Promise<MobileNet> {
    const cachedModels = await io.listModels();
    const cachedMobilenet = Object.keys(cachedModels).filter((x) => x.includes('mobileNet'));
    try {
      this.#mobilenet = await loadMobilenet({
        modelUrl: `indexeddb://mobileNet-v${this.version}-${this.alpha}`,
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
      await this.#mobilenet.model.save(`indexeddb://mobileNet-v${this.version}-${this.alpha}`);
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

  async predict(image: ImageData): Promise<MobileNetResults> {
    if (!this.#mobilenet) {
      throw new Error('Mobilenet is not loaded');
    }
    const results = await this.#mobilenet.classify(image, 5);
    return {
      label: results[0].className,
      confidences: results.reduce((x, y) => ({ ...x, [y.className]: y.probability }), {}),
    };
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new Component({
      target: t,
      props: {
        title: this.title,
        loading: this.$loading,
        version: this.version,
        alpha: this.alpha,
      },
    });
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  train(): never {
    throw new TrainingError('Model `MobileNet` cannot be trained');
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  save(): never {
    throw new Error('MobileNet does not support saving');
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  load(): never {
    throw new Error('MobileNet does not support loading');
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  download(): never {
    throw new Error('MobileNet does not support downloading');
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  upload(): never {
    throw new Error('MobileNet does not support uploading');
  }
}
