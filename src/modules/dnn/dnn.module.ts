// import {
//   load as loadMobilenet,
//   MobileNet,
//   MobileNetVersion,
//   MobileNetAlpha,
// } from '@tensorflow-models/mobilenet';

// import {
//   loadLayersModel,
//   LayersModel,
//   fromPixels
// } from '@tensorflow/tfjs';

import * as tf from '@tensorflow/tfjs';

// import { Tensor } from '@tensorflow/tfjs-core';

import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import Component from './dnn.svelte';




export interface DNNOptions {
  // version?: MobileNetVersion;
  // alpha?: MobileNetAlpha;
  modelUrl?: string;
  mode?: 'string';
}

export interface DNNResults {
  label: string;
  confidences: { [key: string]: number };
}

export class DNN extends Module {
  name = 'dnn';
  description = 'Generic Deep Neural Network module';

  loading: Stream<number>;
  modelFiles: Stream<[]>;
  model: tf.LayersModel;
  saveModelFlag: Stream<number>;
  inputShape: number[];

  constructor({ modelUrl = 'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_1.0_224/model.json' }: DNNOptions = {}) {
    super();
    this.modelFiles = new Stream([], true);
    this.saveModelFlag = new Stream(0, true);
    this.loading = new Stream(0, true);
    this.modelFiles.subscribe((s) => {
      this.load(s);
    });
    
  }

  async saveModel() {
    this.model.save('localstorage://my-model-1');
  }

  async load(urls : []): Promise<DNN> {
    this.loading.set(0);
    if (urls.length){
        this.model = await tf.loadLayersModel(tf.io.browserFiles(urls)); 
        console.log('load model', this.model.inputs[0].shape);
        this.inputShape = Object.values(this.model.inputs[0].shape);
        this.start();
        this.$$.app?.$set({ loading: false });
        this.loading.set(1);
      }
    return this;
  }

  async predict(image: ImageData): Promise<DNNResults> {

    if (!this.model) {
      throw new Error('Model is not loaded');
    }
    const tensorData = tf.image.resizeBilinear(tf.browser.fromPixels(image), [this.inputShape[1], this.inputShape[2]]);
    const outputs: any = await this.model.predict(tensorData.expandDims(0)); // results is a Tensor<Rank> 
    const results: number = outputs.argMax(1).dataSync()[0];
    
    return {
      label: results.toString(),
      confidences: outputs.dataSync().reduce((x: {}, y: number, i: number) => ({...x, [i.toString()]: y}), {}),
    }; 
    
  }

  mount(targetSelector?: string): void {
    this.saveModelFlag.subscribe((s) => {
        if (s === 1) {
          this.model.save('downloads://my-model-1');
          s = 0;
        }
    });
    const target = document.querySelector(targetSelector || `#${this.id}`);
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
        loading: this.loading,
        modelFiles: this.modelFiles,
        saveModelFlag: this.saveModelFlag,
      },
    });
  }
}
