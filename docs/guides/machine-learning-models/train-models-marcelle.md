# Training Models from Marcelle Data

Some applications require training machine learning models from user data. Sometimes, it is important to provide users with personalized models that are fine-tuned on their personal data. In other cases, models can be improved over time by retraining periodically using data collected accross several users.

This guide describes how to train or fine-tune machine learning models from data stored in a Marcelle data store. As described in the dedicated guides (see [Data Management](/guides/data-management/)), Marcelle provides a server-side data management system that can be easily configured and deployed. Marcelle _Data Stores_ are structured in services that store collections of data. A Marcelle _Dataset_ is typically a collection of instances, which can be manipulated with CRUD operations from Python or JavaScript.

The rest of this guide describes how to train models in [JavaScript](#in-javascript), or in [Python](#in-python). We will take image classification as a simple example, and describe both JavaScript and Python implementation of a user-defined image classifier trained from the webcam.

## Collecting Data with the Webcam

Let's start by generating a new Marcelle application:

::: code-group

```bash [npm]
npm init marcelle marcelle-training
cd marcelle-training
npm install
```

```bash [yarn]
yarn create marcelle marcelle-training
cd marcelle-training
yarn
```

```bash [pnpm]
pnpm create marcelle marcelle-training
cd marcelle-training
pnpm i
```

:::

Select the default options of the CLI. Then, make sure the application works by running the development server:

```bash
npm run dev
```

And open [http://localhost:5173](http://localhost:5173) in your browser.

Then, update the main application entry point (`src/index.js`) with the following code:

::: details src/index.js

```js
import '@marcellejs/core/dist/marcelle.css';
import '@marcellejs/gui-widgets/dist/marcelle-gui-widgets.css';
import '@marcellejs/layouts/dist/marcelle-layouts.css';
import { dataset, datasetBrowser, dataStore, webcam } from '@marcellejs/core';
import { button, textInput } from '@marcellejs/gui-widgets';
import { dashboard } from '@marcellejs/layouts';
import { mobileNet } from '@marcellejs/tensorflow';
import { filter, from, map, mergeMap, zip } from 'rxjs';

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = webcam();
const featureExtractor = mobileNet();

const label = textInput();
label.title = 'Instance label';
const capture = button('Hold to record instances');
capture.title = 'Capture instances to the training set';

const store = dataStore('localStorage');
const trainingSet = dataset('training-set-dashboard', store);
const trainingSetBrowser = datasetBrowser(trainingSet);

const $instances = zip(input.$images, input.$thumbnails).pipe(
  filter(() => capture.$pressed.getValue()),
  map(async ([img, thumbnail]) => ({
    x: await featureExtractor.process(img),
    y: label.$value.getValue(),
    thumbnail,
  })),
  mergeMap((x) => from(x)),
);

$instances.subscribe(trainingSet.create);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle Example - Training Models',
  author: 'Myself',
});

dash
  .page('Data Management')
  .sidebar(input, featureExtractor)
  .use([label, capture], trainingSetBrowser);
dash.settings.datasets(trainingSet);

dash.show();
```

:::

## in JavaScript

Love on the beat

## in Python
