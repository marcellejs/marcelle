import '@marcellejs/core/dist/marcelle.css';
import howler from 'https://cdn.jsdelivr.net/npm/howler@2.2.4/+esm';
import {
  batchPrediction,
  datasetBrowser,
  button,
  confusionMatrix,
  dashboard,
  dataset,
  dataStore,
  mlpClassifier,
  mobileNet,
  modelParameters,
  confidencePlot,
  trainingProgress,
  text,
  textInput,
  toggle,
  trainingPlot,
  webcam,
  wizard,
} from '@marcellejs/core';
import { filter, from, map, mergeMap, zip } from 'rxjs';

// -----------------------------------------------------------
// SOUNDS
// -----------------------------------------------------------

const soundFiles = {
  A: '/Trap Percussion FX Loop.mp3',
  B: '/Trap Loop Minimal 2.mp3',
  C: '/Trap Melody Full.mp3',
};

const playMode = 'loop'; // or 'trigger'

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = webcam();
const featureExtractor = mobileNet();

const labelInput = textInput();
labelInput.title = 'Instance label';
const capture = button('Hold to record instances');
capture.title = 'Capture instances to the training set';

const store = dataStore('localStorage');
const trainingSet = dataset('TrainingSet-move2audio', store);
const trainingSetBrowser = datasetBrowser(trainingSet);

const $instances = zip(input.$images, input.$thumbnails).pipe(
  filter(() => capture.$pressed.getValue()),
  map(async ([img, thumbnail]) => ({
    x: await featureExtractor.process(img),
    y: labelInput.$value.getValue(),
    thumbnail,
  })),
  mergeMap((x) => from(x)),
);

$instances.subscribe(trainingSet.create);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = button('Train');
const classifier = mlpClassifier({ layers: [64, 32], epochs: 20 });
classifier.sync(store, 'move2audio-classifier');
b.$click.subscribe(() => classifier.train(trainingSet));

const params = modelParameters(classifier);
const prog = trainingProgress(classifier);
const plotTraining = trainingPlot(classifier);

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchMLP = batchPrediction('mlp', store);
const confMat = confusionMatrix(batchMLP);

const predictButton = button('Update predictions');
predictButton.$click.subscribe(async () => {
  if (!classifier.ready) {
    throwError(new Error('No classifier has been trained'));
  }
  await batchMLP.clear();
  await batchMLP.predict(classifier, trainingSet);
});

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const tog = toggle('toggle prediction');

const $predictions = input.$images.pipe(
  filter(() => tog.$checked.getValue() && classifier.ready),
  map(async (img) => classifier.predict(await featureExtractor.process(img))),
  mergeMap((x) => from(x)),
);

const plotResults = confidencePlot($predictions);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle Example - Wizard',
  author: 'Marcelle Pirates Crew',
  closable: true,
});

dash
  .page('Data Management')
  .sidebar(input, featureExtractor)
  .use([labelInput, capture], trainingSetBrowser);
dash.page('Training').use(params, b, prog, plotTraining);
dash.page('Batch Prediction').use(predictButton, confMat);
dash.page('Real-time Prediction').sidebar(input).use(tog, plotResults);
dash.settings.dataStores(store).datasets(trainingSet).models(classifier);

// -----------------------------------------------------------
// WIZARD
// -----------------------------------------------------------

const wizardButton = button('Record Examples (class a)');
const wizardText = text('Waiting for examples...');
wizardButton.$pressed.subscribe((x) => {
  capture.$pressed.next(x);
});

let countPerClass = { A: 0, B: 0, C: 0 };
trainingSet.$changes.subscribe(async (changes) => {
  for (const { level, type, data } of changes) {
    if (level === 'instance' && type === 'created') {
      countPerClass[data.y] += 1;
    } else if (level === 'instance' && type === 'removed') {
      countPerClass[data.y] -= 1;
    } else {
      const allInstances = await trainingSet.items().select(['y']).toArray();
      for (const l of ['A', 'B', 'C']) {
        countPerClass[l] = allInstances.filter(({ y }) => y === l).length;
      }
    }
  }
  const label = labelInput.$value.value;
  const numExamples = countPerClass[label] || 0;
  wizardText.$value.next(
    numExamples ? `Recorded ${numExamples} examples of "${label}"` : 'Waiting for examples...',
  );
});

const wiz = wizard();

wiz
  .page()
  .title('Record examples for class A')
  .description('Hold on the record button to capture training examples for class A')
  .use(input, wizardButton, wizardText)
  .page()
  .title('Record examples for class B')
  .description('Hold on the record button to capture training examples for class B')
  .use(input, wizardButton, wizardText)
  .page()
  .title('Record examples for class C')
  .description('Hold on the record button to capture training examples for class C')
  .use(input, wizardButton, wizardText)
  .page()
  .title('Train the model')
  .description('Now that we have collected images, we can train the model from these examples.')
  .use(b, prog)
  .page()
  .title('Test the classifier')
  .description('Reproduce your gestures to test if the classifier works as expected')
  .use([input, plotResults]);

labelInput.$value.subscribe((label) => {
  wizardButton.$text.next(`Record Examples (class ${label})`);
  const numExamples = countPerClass[label] || 0;
  wizardText.$value.next(
    numExamples ? `Recorded ${numExamples} examples of "${label}"` : 'Waiting for examples...',
  );
});

wiz.$current.subscribe((pageIndex) => {
  if (pageIndex === 0) {
    labelInput.$value.next('A');
  } else if (pageIndex === 1) {
    labelInput.$value.next('B');
  } else if (pageIndex === 2) {
    labelInput.$value.next('C');
  }
  if (pageIndex === 4) {
    tog.$checked.next(true);
  } else {
    tog.$checked.next(false);
  }
});

// -----------------------------------------------------------
// MAIN APP
// -----------------------------------------------------------

// Setup the webcam
input.$mediastream.subscribe((s) => {
  document.querySelector('#my-webcam').srcObject = s;
});

setTimeout(() => {
  input.$active.next(true);
}, 200);

// Load audio files
let numLoaded = 0;
const sounds = Object.entries(soundFiles).reduce(
  (res, [label, src]) => ({
    ...res,
    [label]: new howler.Howl({
      src: [src],
      loop: playMode === 'loop',
      volume: playMode === 'trigger' ? 1 : 0,
    }),
  }),
  {},
);
const onload = () => {
  numLoaded += 1;
  if (numLoaded === 3 && playMode === 'loop') {
    for (const x of Object.values(sounds)) {
      x.play();
    }
  }
};
for (const s of Object.values(sounds)) {
  s.once('load', onload);
}

// Update the GIFs with real-time recognition
const d = document.querySelector('#results');
const resultImg = document.querySelector('#result-img');

let PrevLabel = '';
$predictions.subscribe(async ({ label, confidences }) => {
  if (label !== PrevLabel) {
    d.innerText = `predicted label: ${label}`;
    if (label === 'A') {
      resultImg.src = 'https://media.giphy.com/media/M9gPbRZTWqZP2/giphy.gif';
    } else if (label === 'B') {
      resultImg.src = 'https://media.giphy.com/media/i6JLRbk4f2gIU/giphy.gif';
    } else {
      resultImg.src = 'https://media.giphy.com/media/hWpgTWoWkqi2NmFeks/giphy.gif';
    }
    PrevLabel = label;
    if (playMode === 'trigger' && label in sounds) {
      sounds[label].volume(confidences[label] || 0);
      sounds[label].playing() ? sounds[label].seek(0) : sounds[label].play();
    }
  }
  if (playMode === 'loop') {
    for (const [key, x] of Object.entries(confidences)) {
      key in sounds && sounds[key].volume(x || 0);
    }
  }
});

document.querySelector('#open-wizard').addEventListener('click', () => {
  wiz.show();
});
document.querySelector('#open-dashboard').addEventListener('click', () => {
  dash.show();
});
