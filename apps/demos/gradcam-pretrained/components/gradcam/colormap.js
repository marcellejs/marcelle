import { buffer as tfBuffer, tidy } from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-core/dist/public/chained_ops/add';
import '@tensorflow/tfjs-core/dist/public/chained_ops/div';
import '@tensorflow/tfjs-core/dist/public/chained_ops/min';
import '@tensorflow/tfjs-core/dist/public/chained_ops/max';
import '@tensorflow/tfjs-core/dist/public/chained_ops/sub';

const RGB_COLORMAP = [
  0.2422, 0.1504, 0.6603, 0.25039, 0.165, 0.70761, 0.25777, 0.18178, 0.75114, 0.26473, 0.19776,
  0.79521, 0.27065, 0.21468, 0.83637, 0.27511, 0.23424, 0.87099, 0.2783, 0.25587, 0.89907, 0.28033,
  0.27823, 0.9221, 0.28134, 0.3006, 0.94138, 0.28101, 0.32276, 0.95789, 0.27947, 0.34467, 0.97168,
  0.27597, 0.36668, 0.9829, 0.26991, 0.3892, 0.9906, 0.26024, 0.41233, 0.99516, 0.24403, 0.43583,
  0.99883, 0.22064, 0.46026, 0.99729, 0.19633, 0.48472, 0.98915, 0.1834, 0.50737, 0.9798, 0.17864,
  0.52886, 0.96816, 0.17644, 0.5499, 0.95202, 0.16874, 0.57026, 0.93587, 0.154, 0.5902, 0.9218,
  0.14603, 0.60912, 0.90786, 0.13802, 0.62763, 0.89729, 0.12481, 0.64593, 0.88834, 0.11125, 0.6635,
  0.87631, 0.09521, 0.67983, 0.85978, 0.068871, 0.69477, 0.83936, 0.029667, 0.70817, 0.81633,
  0.0035714, 0.72027, 0.7917, 0.0066571, 0.73121, 0.76601, 0.043329, 0.7411, 0.73941, 0.096395,
  0.75, 0.71204, 0.14077, 0.7584, 0.68416, 0.1717, 0.76696, 0.65544, 0.19377, 0.77577, 0.6251,
  0.21609, 0.7843, 0.5923, 0.24696, 0.7918, 0.55674, 0.29061, 0.79729, 0.51883, 0.34064, 0.8008,
  0.47886, 0.3909, 0.80287, 0.43545, 0.44563, 0.80242, 0.39092, 0.5044, 0.7993, 0.348, 0.56156,
  0.79423, 0.30448, 0.6174, 0.78762, 0.26124, 0.67199, 0.77927, 0.2227, 0.7242, 0.76984, 0.19103,
  0.77383, 0.7598, 0.16461, 0.82031, 0.74981, 0.15353, 0.86343, 0.7406, 0.15963, 0.90354, 0.73303,
  0.17741, 0.93926, 0.72879, 0.20996, 0.97276, 0.72977, 0.23944, 0.99565, 0.74337, 0.23715, 0.99699,
  0.76586, 0.21994, 0.9952, 0.78925, 0.20276, 0.9892, 0.81357, 0.18853, 0.97863, 0.83863, 0.17656,
  0.96765, 0.8639, 0.16429, 0.96101, 0.88902, 0.15368, 0.95967, 0.91346, 0.14226, 0.9628, 0.93734,
  0.12651, 0.96911, 0.96063, 0.10636, 0.9769, 0.9839, 0.0805,
];

export function applyColorMap(grayScaleImage) {
  return tidy(() => {
    const EPSILON = 1e-5;
    const xRange = grayScaleImage.max().sub(grayScaleImage.min());
    const xNorm = grayScaleImage.sub(grayScaleImage.min()).div(xRange.add(EPSILON));
    const xNormData = xNorm.dataSync();

    const height = grayScaleImage.shape[1];
    const width = grayScaleImage.shape[2];
    const buffer = tfBuffer([1, height, width, 3]);

    const colorMapSize = RGB_COLORMAP.length / 3;
    for (let i = 0; i < height; ++i) {
      for (let j = 0; j < width; ++j) {
        const pixelValue = xNormData[i * width + j];
        const row = Math.floor(pixelValue * colorMapSize);
        buffer.set(RGB_COLORMAP[3 * row], 0, i, j, 0);
        buffer.set(RGB_COLORMAP[3 * row + 1], 0, i, j, 1);
        buffer.set(RGB_COLORMAP[3 * row + 2], 0, i, j, 2);
      }
    }
    return buffer.toTensor();
  });
}
