---
sidebarDepth: 3
---

# @marcellejs/onnx: Components

## onnxModel

```tsx
function onnxModel({
  inputType: 'image' | 'generic';
  taskType: 'classification' | 'generic';
  segmentationOptions?: {
    output?: 'image' | 'tensor';
    inputShape: number[];
  };
}): OnnxModel;
```

This component allows to make predictions using pre-trained models in the ONNX format, using [`onnxruntime-web`](https://github.com/microsoft/onnxruntime/tree/master/js/web). The default backend for inference is `wasm`, as it provides a wider operator support.

The implementation currently supports tensors as input, formatted as nested number arrays, and two types of task (classification, generic prediction). Pre-trained models can be loaded either by URL, or through file upload, for instance using the [`fileUpload`](/api/gui-widgets/components.html#fileupload) component.

Such generic models cannot be trained.

::: warning

onnxruntime-web is not included in the build, to use the `onnxModel` component, add the following line to your `index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.2/dist/ort.wasm.min.js"></script>
```

:::

### Methods

#### .loadFromFile()

```tsx
loadFromFile(file: File): Promise<void>
```

Load a pre-trained ONNX model from a `*.onnx` file.

#### .loadFromUrl()

```tsx
loadFromUrl(url: string): Promise<void>
```

Load a pre-trained ONNX model from a URL.

#### .predict()

```tsx
predict(input: InputTypes[InputType]): Promise<PredictionTypes[TaskType]>
```

Make a prediction from an input instance, which type depends on the `inputType` specified in the constructor. The method is asynchronous and returns a promise that resolves with the results of the prediction.

Input types can be:

- `ImageData` if the model was instanciated with `inputType: 'image'`
- `TensorLike` (= array) if the model was instanciated with `inputType: 'generic'`

Output types can be:

- `ClassifierResults` if the model was instanciated with `taskType: 'classification'`
- `TensorLike` if the model was instanciated with `taskType: 'generic'`

Where classifier results have the following interface:

```ts
interface ClassifierResults {
  label: string;
  confidences: { [key: string]: number };
}
```

### Example

```js
const source = imageUpload();
const classifier = tfjsModel({
  inputType: 'image',
  taskType: 'classification',
});
classifier.loadFromUrl();

const predictionStream = source.$images.map(classifier.predict).awaitPromises();
```
