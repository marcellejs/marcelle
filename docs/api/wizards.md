---
sidebarDepth: 2
---

# Wizards

Wizards are dedicated to the creation of step-by-step guides for beginners or end-users. Wizards are inspired by Teachable machine's [_training wizard_ demo](https://glitch.com/~tm-wizard) that walks users through training their machine learning model. Marcelle wizards are more flexible and allow developers to specify what modules should be displayed at every step. Therefore, wizards can be used to assist the training but could also guide users in the analysis of the model's result.

## Wizard

The following factory function creates and returns an empty Wizard:

```tsx
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

### .destroy()

```tsx
destroy(): void
```

Destroys the dashboard application. This destroys the current view, if it exists, but preserves the configuration, meaning that the dashboard can still be re-started.

### .start()

```tsx
start(): void
```

Starts the dashboard application. The application, a Svelte component instance, is mounted on the document's body, creating an overlay on the current web page without destroying any content.

### .step()

```tsx
step(): Step
```

Add a new step to the wizard, and returns the corresponding `WizardStep` instance.

## WizardStep

They are created using the [`step`](#step) method of a Dashboard.

### .description()

```tsx
description(desc: string): WizardStep
```

Specifies the description, or help, of the current step.

### .step()

```tsx
step(): WizardStep
```

Add a step to the parent wizard.

### .title()

```tsx
title(title: string): WizardStep
```

Define the title of the step.

### .use()

```tsx
use(...modules: Array<Module | Module[] | string>): WizardStep
```

Add a set of modules to the step. The syntax is similar to the one for Dashoards. By default, modules are stacked vertically in the right column of the page. Each argument can either be:

- A module ([`Module`](/api/modules)), displayed full-width on the right column
- An array of module, which are then distributed horizontally
- A string, which defines a section title
