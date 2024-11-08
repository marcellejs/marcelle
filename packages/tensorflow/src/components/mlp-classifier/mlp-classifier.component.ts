import { train, type Tensor } from '@tensorflow/tfjs-core';
import { sequential, layers as tfLayers } from '@tensorflow/tfjs-layers';
import { BehaviorSubject } from 'rxjs';
import { TFJSCustomClassifier, type TFJSCustomClassifierOptions } from '../../core';

export interface MLPClassifierOptions extends TFJSCustomClassifierOptions {
  layers: number[];
}

export class MLPClassifier extends TFJSCustomClassifier {
  title = 'MLPClassifier';

  parameters: {
    layers: BehaviorSubject<number[]>;
  } & TFJSCustomClassifier['parameters'];

  constructor({ layers = [64, 32], ...rest }: Partial<MLPClassifierOptions> = {}) {
    super(rest);
    this.parameters = {
      layers: new BehaviorSubject(layers),
      ...this.parameters,
    };
  }

  buildModel(inputShape: Tensor['shape'], outputShape: Tensor['shape']): void {
    this.model = sequential();
    for (const [i, units] of this.parameters.layers.getValue().entries()) {
      const layerParams: Parameters<typeof tfLayers.dense>[0] = {
        units,
        activation: 'relu',
      };
      if (i === 0) {
        layerParams.inputDim = inputShape[0];
      }
      this.model.add(tfLayers.dense(layerParams));
    }

    this.model.add(
      tfLayers.dense({
        units: outputShape[0],
        activation: 'softmax',
      }),
    );
    const optimizer = train.adam();
    this.model.compile({
      optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });
  }
}
