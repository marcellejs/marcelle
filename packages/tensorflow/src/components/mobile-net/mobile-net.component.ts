import type { GraphModel } from '@tensorflow/tfjs-converter';
import {
  load as loadMobilenet,
  type MobileNet as TfjsMobileNet,
  type MobileNetVersion,
  type MobileNetAlpha,
} from '@tensorflow-models/mobilenet';
import { io, ready, tidy } from '@tensorflow/tfjs-core';
import {
  Catch,
  type ClassifierResults,
  type Instance,
  logger,
  Model,
  TrainingError,
} from '@marcellejs/core';
import Component from './mobile-net.view.svelte';
import { BehaviorSubject } from 'rxjs';
import { mount, unmount } from 'svelte';

export interface MobileNetOptions {
  version?: MobileNetVersion;
  alpha?: MobileNetAlpha;
}

export interface MobileNetInstance extends Instance {
  x: ImageData;
  y: string;
}

export class MobileNet extends Model<MobileNetInstance, ClassifierResults> {
  title = 'mobileNet';

  parameters = {};
  serviceName = 'undefined';

  #mobilenet: (TfjsMobileNet & { model?: GraphModel }) | undefined;
  $loading = new BehaviorSubject(true);
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
    await ready();
    const cachedModels = await io.listModels();
    const cachedMobilenet = Object.keys(cachedModels).filter((x) => x.includes('mobileNet'));
    try {
      this.#mobilenet = await loadMobilenet({
        modelUrl: `indexeddb://mobilenet-v${this.version}-${this.alpha}`,
        version: this.version,
        alpha: this.alpha,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    logger.info(`MobileNet v${this.version} loaded with alpha = ${this.alpha}`);
    this.$loading.next(false);
    return this;
  }

  async process(image: ImageData): Promise<number[]> {
    if (!this.#mobilenet) return [];
    return tidy(() => {
      const x = this.#mobilenet.infer(image, true).arraySync() as number[][];
      return x[0];
    });
  }

  async predict(image: ImageData): Promise<ClassifierResults> {
    if (!this.#mobilenet) {
      throw new Error('Mobilenet is not loaded');
    }
    const results = await this.#mobilenet.classify(image, 5);
    return {
      label: results[0].className,
      confidences: results.reduce((x, y) => ({ ...x, [y.className]: y.probability }), {}),
    };
  }

  mount(target?: HTMLElement) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    const app = mount(Component, {
      target: t,
      props: {
        loading: this.$loading,
        version: this.version,
        alpha: this.alpha,
      },
    });
    return () => unmount(app);
  }

  @Catch
  train(): never {
    throw new TrainingError('Model `MobileNet` cannot be trained');
  }

  @Catch
  save(): never {
    throw new Error('MobileNet does not support saving');
  }

  @Catch
  load(): never {
    throw new Error('MobileNet does not support loading');
  }

  @Catch
  download(): never {
    throw new Error('MobileNet does not support downloading');
  }

  @Catch
  upload(): never {
    throw new Error('MobileNet does not support uploading');
  }
}
