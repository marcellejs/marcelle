// import { Instance } from '@marcellejs/core';
// import fetch from 'node-fetch';
import { Instance, logger, Model } from '../../core';
import { Stream } from '../../core/stream';
import { Catch, TrainingError } from '../../utils/error-handling';

import View from './huggingface-model.view.svelte';

export interface HuggingfaceModelOptions {
  API_TOKEN?: string;
  model?: string;

}

export interface HuggingfaceModelInstance extends Instance {
  x: string[];
  y: number[];
}

export interface ModelResult {
  response: any
}

export class HuggingfaceModel extends Model<HuggingfaceModelInstance, ModelResult> {
  title: string;
  options: HuggingfaceModelOptions;
  $loading = new Stream(true, true);
  parameters = {};
  serviceName = 'huggingface model';


  constructor({API_TOKEN, model} : HuggingfaceModelOptions = {}) {
    super();
    this.title = `huggingfaceModel ${model} [custom component 🤖]`;
    // this.options = options;
    this.options = { API_TOKEN, model } ;
    this.setup(API_TOKEN);
  }

  async setup(API_TOKEN: string) : Promise<HuggingfaceModel> {

    this.options.API_TOKEN = API_TOKEN;
    // test if the model link and api token work
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${this.options.model}`,
        {
            headers: { Authorization: `Bearer ${this.options.API_TOKEN}` },
            method: "POST",
            body: JSON.stringify("test"),
        }
      );
      const result = response.json();
      logger.log(`test huggingface api result: ${result}`)

    } catch(err) {
      logger.log(err);
    }
    this.$loading.set(false);
    this.start();
    return this;
  }


  async process(data : any): Promise<any> {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${this.options.model}`,
      {
          headers: { Authorization: `Bearer ${this.options.API_TOKEN}` },
          method: "POST",
          body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    return result
  }

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
