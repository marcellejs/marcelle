/* global tf, mostCore */

let model;
export async function loadModel(name) {
  model = await tf.loadLayersModel(name);
  return model;
}

export function predict(inputStream) {
  return mostCore.awaitPromises(
    mostCore.map(
      async (x) => {
        const res = await model.predict(x);
        return res.gather(0).mul(0.5).add(0.5);
      },
      mostCore.filter(() => !!model, inputStream),
    ),
  );
}

export function generateNoise(s) {
  return mostCore.map(() => tf.tidy(() => tf.randomNormal([1, 100])), s);
}

// the scalars needed for conversion of each channel
// per the formula: gray = 0.2989 * R + 0.5870 * G + 0.1140 * B
const rFactor = tf.scalar(0.2989);
const gFactor = tf.scalar(0.587);
const bFactor = tf.scalar(0.114);
export function downsampleCamera(images) {
  return mostCore.map((imgData) => {
    const x = tf.browser.fromPixels(imgData).div(255);

    // separate out each channel. x.shape[0] and x.shape[1] will give you
    // the correct dimensions regardless of image size
    const r = x.slice([0, 0, 0], [x.shape[0], x.shape[1], 1]);
    const g = x.slice([0, 0, 1], [x.shape[0], x.shape[1], 1]);
    const b = x.slice([0, 0, 2], [x.shape[0], x.shape[1], 1]);

    // add all the tensors together, as they should all be the same dimensions.
    return r.mul(rFactor).add(g.mul(gFactor)).add(b.mul(bFactor));
  }, images);
}
