import '../../dist/marcelle.css';
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
  textField,
  toggle,
  trainingPlot,
  webcam,
  wizard,
} from '../../dist/marcelle.esm';

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = webcam();
const featureExtractor = mobileNet();

const labelInput = textField();
labelInput.title = 'Instance label';
const capture = button({ text: 'Hold to record instances' });
capture.title = 'Capture instances to the training set';

const store = dataStore('localStorage');
const trainingSet = dataset('TrainingSet-wizard', store);
const trainingSetBrowser = datasetBrowser(trainingSet);

input.$images
  .filter(() => capture.$down.value)
  .map(async (img) => ({
    x: await featureExtractor.process(img),
    y: labelInput.$text.value,
    thumbnail: input.$thumbnails.value,
  }))
  .awaitPromises()
  .subscribe(trainingSet.create.bind(trainingSet));

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = button({ text: 'Train' });
const classifier = mlpClassifier({ layers: [64, 32], epochs: 20, dataStore: store });
classifier.sync('wizard-classifier');
b.$click.subscribe(() => classifier.train(trainingSet));

const params = modelParameters(classifier);
const prog = trainingProgress(classifier);
const plotTraining = trainingPlot(classifier);

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchMLP = batchPrediction({ name: 'mlp', dataStore: store });
const confMat = confusionMatrix(batchMLP);

const predictButton = button({ text: 'Update predictions' });
predictButton.$click.subscribe(async () => {
  await batchMLP.clear();
  await batchMLP.predict(classifier, trainingSet);
});

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const tog = toggle({ text: 'toggle prediction' });

const $predictions = input.$images
  .filter(() => tog.$checked.value)
  .map(async (img) => classifier.predict(await featureExtractor.process(img)))
  .awaitPromises();

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
  .useLeft(input, featureExtractor)
  .use([labelInput, capture], trainingSetBrowser);
dash.page('Training').use(params, b, prog, plotTraining);
dash.page('Batch Prediction').use(predictButton, confMat);
dash.page('Real-time Prediction').useLeft(input).use(tog, plotResults);
dash.settings.dataStores(store).datasets(trainingSet).models(classifier);

// -----------------------------------------------------------
// WIZARD
// -----------------------------------------------------------

const wizardButton = button({ text: 'Record Examples (class a)' });
const wizardText = text({ text: 'Waiting for examples...' });
wizardButton.$down.subscribe((x) => {
  capture.$down.set(x);
});

let countPerClass = { A: 0, B: 0 };
trainingSet.$changes.subscribe(async (changes) => {
  for (const { level, type, data } of changes) {
    if (level === 'instance' && type === 'created') {
      if (!(data.y in countPerClass)) countPerClass[data.y] = 0;
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
  const label = labelInput.$text.value;
  const numExamples = countPerClass[label] || 0;
  wizardText.$text.set(
    numExamples ? `Recorded ${numExamples} examples of "${label}"` : 'Waiting for examples...',
  );
});

const wiz = wizard();

wiz
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

labelInput.$text.subscribe((label) => {
  wizardButton.$text.set(`Record Examples (class ${label})`);
  const numExamples = countPerClass[label] || 0;
  wizardText.$text.set(
    numExamples ? `Recorded ${numExamples} examples of "${label}"` : 'Waiting for examples...',
  );
});

wiz.$current.subscribe((stepIndex) => {
  if (stepIndex === 0) {
    labelInput.$text.set('A');
  } else if (stepIndex === 1) {
    labelInput.$text.set('B');
  }
  if (stepIndex === 3) {
    tog.$checked.set(true);
  } else {
    tog.$checked.set(false);
  }
});

// -----------------------------------------------------------
// MAIN APP
// -----------------------------------------------------------

// Setup the webcam
input.$mediastream.subscribe((s) => {
  document.querySelector('#my-webcam').srcObject = s;
});

function startCamera() {
  input.$active.set(true);
  document.body.removeEventListener('mousemove', startCamera);
}
document.body.addEventListener('mousemove', startCamera);

// Update the GIFs with real-time recognition
const d = document.querySelector('#results');
const resultImg = document.querySelector('#result-img');

let PrevLabel = '';
$predictions.subscribe(async ({ label }) => {
  if (label !== PrevLabel) {
    d.innerText = `predicted label: ${label}`;
    resultImg.src =
      label === 'A'
        ? 'https://media.giphy.com/media/zlVf2eSgXIFFuTnEhz/giphy.gif'
        : 'https://media.giphy.com/media/Oc8lIQHZsXqDu/giphy.gif';
    PrevLabel = label;
  }
});

document.querySelector('#open-wizard').addEventListener('click', () => {
  wiz.start();
});

document.querySelector('#open-dashboard').addEventListener('click', () => {
  dash.start();
});
