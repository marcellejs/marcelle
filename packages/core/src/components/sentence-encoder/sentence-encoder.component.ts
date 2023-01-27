import type { GraphModel } from '@tensorflow/tfjs-converter';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { io } from '@tensorflow/tfjs-core';
import { Instance, logger, Model } from '../../core';
import { Stream } from '../../core/stream';
import { Catch, TrainingError } from '../../utils/error-handling';
import View from './sentence-encoder.view.svelte';

export interface SentenceEncoderOptions {
  vocabUrl?: string;
  // [key: string]: unknown;
}

export interface SentenceEncoderInstance extends Instance {
  x: string[];
  y: number[];
}

export interface SentenceEmbedding {
  tokens: number[]
}

export class SentenceEncoder extends Model<SentenceEncoderInstance, SentenceEmbedding> {
  title = 'sentenceEncoder';
  options: SentenceEncoderOptions;
  parameters = {};
  serviceName = 'undefined';


  #sentenceEncoder: (any & { model?: GraphModel }) | undefined;
  // #tokenizer: any | undefined;

  $loading = new Stream(true, true);
  readonly vocabUrl: string;


  constructor({vocabUrl = undefined } : SentenceEncoderOptions = {}) {
    super();
    this.title = 'sentenceEncoder';
    this.vocabUrl = vocabUrl;
    this.setup();
  }

  async setup(): Promise<SentenceEncoder> {
    const cachedModels = await io.listModels();
    const cachedSentenceEncoder = Object.keys(cachedModels).filter((x) => x.includes('sentenceEncoder'));
    try {
      this.#sentenceEncoder = await use.load();
      // this.#tokenizer = await use.loadTokenizer();
    } catch (error) {
      console.log("????", error);
      if (cachedSentenceEncoder.length > 0) {
        await io.removeModel(cachedSentenceEncoder[0]);
      }
      this.#sentenceEncoder = await use.load();
      // this.#tokenizer = await use.loadTokenizer();

      await this.#sentenceEncoder.model.save(`indexeddb://sentenceEncoder`);
    }
    logger.info(`SentenceEncoder loaded with vocab = ${this.vocabUrl}`);
    this.$loading.set(false);
    this.start();
    return this;
  }


  async process(sentences: string[]): Promise<number[][]> {
    if (!this.#sentenceEncoder) return [];
    console.log(sentences);
    // return tidy(() => {
    
    const x = await this.#sentenceEncoder.embed(sentences);
    const y = x.arraySync();
      // .then((x: any) => x.print(true))
      // x.print();
      // const y = x.arraySync() as number[][];
      return y;
    // });
  }

  // async tokenize(sentence: string): Promise<number[]> {
  //   if (!this.#tokenizer) return [];
  //   return tidy(() => {
  //     const x = this.#tokenizer.encode(sentence).arraySync() as number[];
  //     return x;
  //   });
  // }


  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        options: this.options,
      },
    });
  }

  // @Catch
  // // eslint-disable-next-line class-methods-use-this
  // process(): never {
  //   throw new TrainingError('Model `SentenceEncoder` only has embed and tokenize functions');
  // }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  predict(): never {
    throw new TrainingError('Model `SentenceEncoder` only has embed and tokenize functions');
  }



  @Catch
  // eslint-disable-next-line class-methods-use-this
  train(): never {
    throw new TrainingError('Model `SentenceEncoder` cannot be trained');
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  save(): never {
    throw new Error('SentenceEncoder does not support saving');
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  load(): never {
    throw new Error('SentenceEncoder does not support loading');
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  download(): never {
    throw new Error('SentenceEncoder does not support downloading');
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  upload(): never {
    throw new Error('SentenceEncoder does not support uploading');
  }
}
