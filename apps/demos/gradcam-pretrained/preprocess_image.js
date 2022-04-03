import { browser, image as tfImage, reshape, tidy } from '@tensorflow/tfjs-core';

const defaults = {
  width: 0,
  height: 0,
  min: 0,
  max: 255,
  mean: undefined,
  std: undefined,
  channelsFirst: false,
};

const imagenetTfDefaults = {
  width: 0,
  height: 0,
  min: -1,
  max: 1,
  mean: undefined,
  std: undefined,
  channelsFirst: false,
};

const imagenetTorchDefaults = {
  width: 0,
  height: 0,
  min: 0,
  max: 1,
  mean: [0.485, 0.456, 0.406],
  std: [0.229, 0.224, 0.225],
  channelsFirst: false,
};

const imagenetCaffeDefaults = {
  width: 0,
  height: 0,
  min: 0,
  max: 255,
  mean: [103.939, 116.779, 123.68],
  std: undefined,
  channelsFirst: true,
};

const presets = {
  default: defaults,
  'keras:efficientnet': defaults,
  'keras:mobilenet_v3': defaults,
  'imagenet:tf': imagenetTfDefaults,
  'keras:mobilenet': imagenetTfDefaults,
  'keras:mobilenet_v2': imagenetTfDefaults,
  'keras:resnet_v2': imagenetTfDefaults,
  'keras:xception': { ...imagenetTfDefaults, width: 299, height: 299 },
  'imagenet:torch': imagenetTorchDefaults,
  'keras:densenet': imagenetTorchDefaults,
  'imagenet:caffe': imagenetCaffeDefaults,
  'keras:resnet': imagenetCaffeDefaults,
  'keras:vgg16': imagenetCaffeDefaults,
  'imagenet:onnx': {
    width: 0,
    height: 0,
    min: 0,
    max: 1,
    mean: [0.485, 0.456, 0.406],
    std: [0.229, 0.224, 0.225],
    channelsFirst: true,
  },
};

async function preprocImage(options, image) {
  const { width, height, min, max, mean, std, channelsFirst } = {
    ...presets[options.preset || 'default'],
    ...options,
  };
  const tfTensor = tidy(() => {
    let t = browser.fromPixels(image);
    if (width > 0 && height > 0) {
      t = tfImage.resizeBilinear(t, [width, height]);
    } else if (width > 0 && height === 0) {
      const h = (image.height * width) / image.width;
      t = tfImage.resizeBilinear(t, [width, h]);
    } else if (width === 0 && height > 0) {
      const w = (image.width * height) / image.height;
      t = tfImage.resizeBilinear(t, [w, height]);
    }
    if (channelsFirst) {
      t = t.transpose([2, 0, 1]);
    }
    t = t.mul((max - min) / 255.0);
    t = t.add(min);
    if (mean) {
      if (Array.isArray(mean)) {
        if (channelsFirst) {
          t = t.sub(reshape(mean, [1, mean.length, 1, 1]));
        } else {
          t = t.sub(reshape(mean, [1, 1, 1, mean.length]));
        }
      } else {
        t = t.sub(mean);
      }
    }
    if (std) {
      if (Array.isArray(std)) {
        if (channelsFirst) {
          t = t.div(reshape(std, [1, std.length, 1, 1]));
        } else {
          t = t.div(reshape(std, [1, 1, 1, std.length]));
        }
      } else {
        t = t.div(std);
      }
    }

    return t;
  });
  const result = await tfTensor.array();
  tfTensor.dispose();
  return result;
}

export function preprocessImage(options, image) {
  if (image !== undefined) {
    return preprocImage(options, image);
  }
  return (img) => preprocImage(options, img);
}
