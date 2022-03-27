import { Component } from '@marcellejs/core';
import {
  browser,
  dispose,
  grad,
  mean,
  mul,
  relu,
  sum,
  tidy,
  expandDims,
  image as tfImage,
} from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-core/dist/public/chained_ops/sum';
import '@tensorflow/tfjs-core/dist/public/chained_ops/add';
import '@tensorflow/tfjs-core/dist/public/chained_ops/max';
import '@tensorflow/tfjs-core/dist/public/chained_ops/expand_dims';
import '@tensorflow/tfjs-core/dist/public/chained_ops/squeeze';
import { input, loadLayersModel, model } from '@tensorflow/tfjs-layers';
import { applyColorMap } from './colormap';
import View from './gradcam.view.svelte';

function toArray(x) {
  return Array.isArray(x) ? x : [x];
}

export class Gradcam extends Component {
  constructor() {
    super();
    this.title = 'gradcam';
    this.model = undefined;
    this.modelCopy = null;
    this.subModels = null;
  }

  setModel(m) {
    this.model = m;
    this.layerName = this.inferGradCamTargetLayer();
    this.modelCopy = null;
    this.subModels = null;
  }

  mount(target) {
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

  getLayersNames() {
    return this.model.layers.map(({ name }) => name);
  }

  selectLayer(name) {
    this.layerName = name || this.inferGradCamTargetLayer();
    this.buildGradModel();
  }

  inferGradCamTargetLayer() {
    let found = 0;
    for (let i = this.model.layers.length - 1; i >= 0; i--) {
      if (this.model.layers[i].output.shape.length === 4) {
        found += 1;
        if (found === 1) {
          return this.model.layers[i].name;
        }
      }
    }
    throw new Error('Model does not seem to contain 4D layer. Grad CAM cannot be applied.');
  }

  async buildGradModel() {
    try {
      if (this.modelCopy) {
        this.modelCopy.layers.forEach((l) => {
          l.dispose();
        });
        dispose(this.modelCopy);
      }
      if (this.subModels) {
        this.subModels.forEach((m) => {
          m.layers.forEach((l) => {
            l.dispose();
          });
          dispose(m);
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('dispose error', error);
    }

    // eslint-disable-next-line no-undef
    this.modelCopy = await new Promise((resolve) => this.model.save({ save: resolve })).then(
      (modelData) => loadLayersModel({ load: () => modelData }),
    );

    const layerIdx = this.modelCopy.layers.map(({ name }) => name).indexOf(this.layerName);
    if (layerIdx < 0) {
      throw new Error(`Could not find Layer ${this.layerName}`);
    }
    const layer = this.modelCopy.layers[layerIdx];
    const lastConvLayerOutput = layer.output;
    const subModel1Outputs = [lastConvLayerOutput];

    // Create "sub-model 2", which goes from the output of the last convolutional
    // layer to the output before the softmax layer
    const subModel2Inputs = [
      input({
        shape: lastConvLayerOutput.shape.slice(1),
      }),
    ];

    let currentOutput = subModel2Inputs[0];
    const outputRefs = [subModel2Inputs[0]];
    for (let i = layerIdx + 1; i < this.modelCopy.layers.length; i++) {
      const l = this.modelCopy.layers[i];
      const lInputNames = toArray(l.input).map(({ originalName }) => originalName);
      const crtInputs = lInputNames.map((name) => {
        const foundRefs = outputRefs.filter(({ originalName }) => originalName === name);
        if (name === lastConvLayerOutput.originalName) {
          return subModel2Inputs[0];
        }
        if (foundRefs.length === 1) {
          return foundRefs[0];
        }
        if (foundRefs.length === 0) {
          const originalLayer = this.modelCopy.layers.filter((ll) => {
            try {
              return ll.output.originalName === name;
            } catch (error) {
              return false;
            }
          })[0];
          const newInput = input({
            shape: originalLayer.output.shape.slice(1),
          });
          subModel2Inputs.push(newInput);
          subModel1Outputs.push(originalLayer.output);
          return newInput;
        }
        throw new Error('What??');
      });
      currentOutput = this.modelCopy.layers[i].apply(crtInputs);
      toArray(currentOutput).forEach((o) => {
        outputRefs.push(o);
      });
    }

    const subModel2 = model({
      inputs: subModel2Inputs,
      outputs: currentOutput,
    });

    // Create "sub-model 1", which goes from the original input to the output
    // of the last convolutional layer
    const subModel1 = model({
      inputs: this.modelCopy.inputs,
      outputs: subModel1Outputs,
    });

    this.subModels = [subModel1, subModel2];
  }

  explain(image, classIndex) {
    // useGuidedGrads = false
    if (classIndex < 0) {
      throw new Error('Invalid class index!');
    }
    // Generate the heatMap
    const g = tidy(() => {
      const inputShape = this.model.inputs[0].shape.map((x) => (x && x > 0 ? x : 1));
      const inputTensor = tfImage
        .resizeBilinear(browser.fromPixels(image), [inputShape[1], inputShape[2]])
        .div(127.5)
        .sub(1.0)
        .expandDims(0);

      // Calculate the values of the last conv layer's output
      const model1OutputValues = this.subModels[0].apply(inputTensor);
      // console.log('model1OutputValues', model1OutputValues);
      const [convOutput, ...otherInputs] = toArray(model1OutputValues);
      // console.log('convOutput.shape', convOutput.shape);

      // run the sub-model 2 and extract the slice of the probability output
      // that corresponds to the desired class
      const convOutput2ClassOutputs = (x) =>
        this.subModels[1].apply([x, ...otherInputs], { training: true }).gather([classIndex], 1);

      // This is the gradient function of the output corresponding to the desired
      // class with respect to its input (i.e., the output of the last convolutional
      // layer of the original model)
      const gradFunction = grad(convOutput2ClassOutputs);

      // Calculate the values of gradients of the class output w.r.t. the
      // output of the last convolutional layer
      const gradValues = gradFunction(convOutput);
      // console.log('gradValues.dtype', gradValues.dtype);
      // console.log('gradValues.shape', gradValues.shape);

      // Calculate the weights of the feature maps
      const weights = mean(gradValues, [0, 1, 2]);
      // console.log('weights.shape', weights.shape);
      // console.log('weights', weights.arraySync());
      weights.print();

      const weightedFeatures = expandDims(sum(mul(weights, convOutput), -1), -1);
      // console.log('weightedFeatures.shape', weightedFeatures.shape);

      // apply ReLu to the weighted features
      let heatMap = relu(weightedFeatures);
      // console.log('heatMap.shape', heatMap.shape);
      // console.log('heatMap', heatMap);

      // // normalize the heat map
      heatMap = heatMap.div(heatMap.max());

      // Up-sample the heat map to the size of the input image
      // @ts-ignore
      heatMap = tfImage.resizeBilinear(heatMap, [inputTensor.shape[1], inputTensor.shape[2]]);

      // Apply an RGB colormap on the heatMap to convert to grey scale heatmap into a RGB one
      let gradCAM = applyColorMap(heatMap);

      // To form the final output, overlay the color heat map on the input image
      gradCAM = gradCAM.mul(2).add(inputTensor.add(2).div(2));

      gradCAM = gradCAM.div(gradCAM.max());

      return gradCAM.squeeze();
    });
    // // @ts-ignore
    return browser
      .toPixels(g)
      .then((data) => new ImageData(data, g.shape[0], g.shape[1]))
      .then((img) => {
        g.dispose();
        return img;
      });
  }
}
