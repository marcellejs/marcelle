---
sidebarDepth: 2
---

# Wizards

Wizards are dedicated to the creation of step-by-step guides for beginners or end-users. Wizards are inspired by Teachable machine's [_training wizard_ demo](https://glitch.com/~tm-wizard) that walks users through training their machine learning model. Marcelle wizards are more flexible and allow developers to specify what modules should be displayed at every step. Therefore, wizards can be used to assist the training but could also guide users in the analysis of the model's result.

## Wizard

The following factory function creates and returns an empty Wizard:

```ts
createWizard(): Wizard
```

**Example**

```js
const wizard = marcelle.createWizard();

wizard
  .step()
  .title('Record examples for class A')
  .description('Hold on the record button to capture training examples for class A')
  .use(input, wizardButton, wizardText)
  .step()
  .title('Record examples for class B')
  .description('Hold on the record button to capture training examples for class B')
  .use(input, wizardButton, wizardText)
  .step()
  .title('Train the model')
  .description('Now that we have collected images, we can train the model from these examples.')
  .use(b, prog)
  .step()
  .title('Test the classifier')
  .description('Reproduce your gestures to test if the classifier works as expected')
  .use([input, plotResults]);
```

### .step()

```ts
step(): Step
```

Add a new step to the wizard, and returns the corresponding `WizardStep` instance.

### .start()

```ts
start(): void
```

Starts the dashboard application. The application, a Svelte component instance, is mounted on the document's body, creating an overlay on the current web page without destroying any content.

### .destroy()

```ts
destroy(): void
```

Destroys the dashboard application. This destroys the current view, if it exists, but preserves the configuration, meaning that the dashboard can still be re-started.

## WizardStep

::: warning TODO
Description
:::

They are created using the [`step`](#step) method of a Dashboard.

### .title()

```ts
title(title: string): WizardStep
```

::: warning TODO
Description + Example
:::

### .description()

```ts
description(desc: string): WizardStep
```

::: warning TODO
Description + Example
:::

### .use()

```ts
use(...modules: Array<Module | Module[] | string>): WizardStep
```

::: warning TODO
Description + Example
:::

### .step()

```ts
step(): WizardStep
```

::: warning TODO
Description + Example
:::
