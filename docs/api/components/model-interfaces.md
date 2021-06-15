---
sidebarDepth: 3
---

# Model interfaces

## modelParameters

```tsx
marcelle.modelParameters(p: Parametrable): ModelParameters;
```

This component provides an GUI for visualizing and adjusting parameters. It takes a `Parametrable` object as argument, which is an object (typically a model) carrying a `parameters` property which is a record of parameter streams:

```ts
interface Parametrable {
  parameters: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [name: string]: Stream<any>;
  };
}
```

The component will automatically display all parameters with appropriate GUI Widgets.

### Parameters

| Option | Type         | Description                                                             | Required |
| ------ | ------------ | ----------------------------------------------------------------------- | :------: |
| p      | Parametrable | An object exposing parameters as streams to visualize and make editable |    ✓     |

### Screenshot

<div style="background: rgb(237, 242, 247); padding: 8px; margin-top: 1rem;">
  <img src="./images/model-parameters.png" alt="Screenshot of the parameters component">
</div>

### Example

```js
const classifier = marcelle.mlp({ layers: [64, 32], epochs: 20 });
const params = marcelle.parameters(classifier);

dashboard.page('Training').use(params);
```

## trainingProgress

```tsx
marcelle.trainingProgress(m: Model): Progress;
```

Displays the progress of the training process for a given model.

### Parameters

| Option | Type  | Description                                            | Required |
| ------ | ----- | ------------------------------------------------------ | :------: |
| m      | Model | A machine learning model exposing a `$training` stream |    ✓     |

### Screenshot

<div style="background: rgb(237, 242, 247); padding: 8px; margin-top: 1rem;">
  <img src="./images/training-progress.png" alt="Screenshot of the training-progress component">
</div>

### Example

```js
const classifier = marcelle.mlp({ layers: [64, 32], epochs: 20 });
const prog = marcelle.trainingProgress(classifier);
```

## trainingPlot

```tsx
marcelle.trainingPlot(m: Model): Progress;
```

Displays the training/validation loss and accuracies during the training of a neural network.

### Parameters

| Option | Type | Description                                                                                | Required |
| ------ | ---- | ------------------------------------------------------------------------------------------ | :------: |
| m      | MLP  | A neural network providing losses and accuracies in the `$training` stream during training |    ✓     |

### Screenshot

<div style="background: rgb(237, 242, 247); padding: 8px; margin-top: 1rem;">
  <img src="./images/training-plot.png" alt="Screenshot of the trainingPlot component">
</div>

### Example

```js
const classifier = marcelle.mlp({ layers: [64, 32], epochs: 20 });
const prog = marcelle.trainingPlot(classifier);
```
