---
sidebarDepth: 3
---

# @marcellejs/onnx

This package brings [onnxruntime-web](https://onnxruntime.ai/) to Marcelle, making it possible to run inference on ONNX models in Marcelle client-side apps. [ONNX](https://onnx.ai) is an open format built to represent machine learning models. Models can be converted to ONNX from a variety of ML frameworks including Scikit-Learn, Tensorflow and PyTorch.

For more detail, see [Supported Tools](https://onnx.ai/supported-tools.html) on the ONNX website.

::: warning
ONNX Runtime might have limitations regarding compatibility with ML frameworks, in terms of supported versions and operators.
:::

## Installation

To install the package:

::: code-group

```bash [npm]
npm install @marcellejs/onnx
```

```bash [yarn]
npm add @marcellejs/onnx
```

```bash [pnpm]
pnpm add @marcellejs/onnx
```

:::

Additionally, [onnxruntime-web](https://onnxruntime.ai/) must be imported in a script tag, as it is not shipped with the package. Since the runtime relies on WASM files, importing from a script tag avoids having to copy all wasm assets. Include the following line to the head of your application:

```html
<script src="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.2/dist/ort.wasm.min.js"></script>
```

::: tip
Note that is it possible to use a different backend such as WebGPU by importing the appropriate file:

```html
<script src="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.2/dist/ort.webgpu.min.js"></script>
```

:::

## Usage

This package provides one main component called `onnxModel`, which is compatible with Marcelle's model API. It can load from a file or URL a model in `.onnx` format. In a typical workflow, we would (1) train a model with a Python-based ML framework and convert it to ONNX, then (2) run inference in a Marcelle app.

### Converting a model to ONNX

Refer to [Supported Tools](https://onnx.ai/supported-tools.html) on the ONNX website.

Following a [simple example with Scikit-Learn](https://onnx.ai/sklearn-onnx/), we can convert an IRIS classifier with the sklearn-onnx package:

```py
from skl2onnx import to_onnx

onx = to_onnx(clr, X[:1])
with open("rf_iris.onnx", "wb") as f:
    f.write(onx.SerializeToString())
```

### Loading the model

We can then load the model in the Marcelle applidation, either by URL or by direct file upload. The component accept various types of input and of ML Task, refer to the reference for more details.

```js
export const classifier = onnxModel({
  inputType: 'generic',
  taskType: 'classification',
  inputShape: [1, 4],
});
classifier.labels = ['Setosa', 'Versicolor', 'Virginica'];

// Load the model from the app's server (public directory)
classifier.loadFromURL('/rf_iris.onnx');
```

## Examples

Two demos of classification and regression are provided online.

https://marcelle-demos-next.netlify.app/
