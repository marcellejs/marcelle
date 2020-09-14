/* eslint-disable no-undef */

// -----------------------------------------------------------
// INPUT PIPELINE & CAPTURE TO DATASET
// -----------------------------------------------------------

const w = webcam();
const m = mobilenet();

const cap = capture({ input: w.$images, thumbnail: w.$thumbnails });
const instances = createStream(
  awaitPromises(
    map(
      async (instance) => ({
        ...instance,
        type: 'image',
        features: await m.process(instance.data),
      }),
      cap.$instances,
    ),
  ),
);

const backend = createBackend({ location: 'localStorage' });
const trainingSet = dataset({ name: 'TrainingSet', backend });
trainingSet.capture(instances);

const trainingSetBrowser = browser(trainingSet);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = button({ text: 'Train' });
const classifier = mlp({ layers: [64, 32], epochs: 20 });
b.$click.subscribe(() => classifier.train(trainingSet));

const params = parameters(classifier);
const prog = progress(classifier);
const plotTraining = trainingPlotter(classifier);

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchMLP = batchPrediction({ name: 'mlp', backend });
const predictButton = button({ text: 'Update predictions' });
const predictionAccuracy = text({ text: 'Waiting for predictions...' });
const confusionMatrix = confusion(batchMLP);

predictButton.$click.subscribe(async () => {
  await batchMLP.clear();
  await batchMLP.predict(classifier, trainingSet);
});

batchMLP.$predictions.subscribe(async () => {
  const { data: predictions } = await batchMLP.predictionService.find();
  const accuracy =
    predictions
      .map(({ label, trueLabel }) => (label === trueLabel ? 1 : 0))
      .reduce((x, y) => x + y, 0) / predictions.length;
  predictionAccuracy.$text.set(`Global Accuracy: ${accuracy}`);
});

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const tog = toggle({ text: 'toggle prediction' });
const results = text({ text: 'waiting for predictions...' });

// DOM Stuff for the app
const d = document.querySelector('#results');
const resultImg = document.querySelector('#result-img');

const confidenceStream = createStream([], true);
const plotConfidences = plotter({
  series: [{ name: 'Confidence', data: confidenceStream }],
  options: {
    chart: { type: 'bar' },
  },
});
plotConfidences.name = 'confidences';

let PrevLabel = '';
createStream(filter(() => tog.$checked.value, w.$images)).subscribe(async (img) => {
  const { label, confidences } = await classifier.predict(await m.process(img));
  results.$text.set(
    `<h2>predicted label: ${label}</h2>
      <p>Confidences: ${Object.values(confidences).map((z) => z.toFixed(2))}</p>`,
  );
  if (y.label !== PrevLabel) {
    d.innerText = `predicted label: ${y.label}`;
    resultImg.src =
      y.label === 'A'
        ? 'https://media.giphy.com/media/zlVf2eSgXIFFuTnEhz/giphy.gif'
        : 'https://media.giphy.com/media/Oc8lIQHZsXqDu/giphy.gif';
    PrevLabel = y.label;
  }
  confidenceStream.set(
    Object.entries(confidences).map(([label, value]) => ({ x: label, y: value })),
  );
});

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dashboard = createDashboard({
  title: 'Marcelle Starter',
  author: 'Marcelle Pirates Crew',
  datasets: [trainingSet],
});

dashboard.page('Data Management').useLeft(w, m).use(cap, trainingSetBrowser);
dashboard.page('Training').use(params, b, prog);
dashboard.page('Real-time prediction').useLeft(w).use(tog, results);

// -----------------------------------------------------------
// WIZARD
// -----------------------------------------------------------

const bbb = button({ text: 'Record Examples (class a)' });
const ttt = text({ text: 'Waiting for examples...' });
bbb.$down.subscribe((x) => {
  cap.$capturing.set(x);
});
trainingSet.$countPerClass.subscribe((c) => {
  const label = cap.$label.value;
  const numExamples = c[label];
  ttt.$text.set(
    numExamples ? `Recorded ${numExamples} examples of "${label}"` : 'Waiting for examples...',
  );
});

const wizard = createWizard();

wizard
  .step()
  .title('Record examples for class A')
  .description('Ich bin ein description')
  .use(w, bbb, ttt)
  .step()
  .title('Record examples for class B')
  .description('Ich bin ein description')
  .use(w, bbb, ttt)
  .step()
  .title('Train the model')
  .description('Ich bin ein MLP')
  .use(b, prog)
  .step()
  .title('Test the classifier')
  .description('Ich bin ein classifier')
  .use(w, tog, results);

function configureWizard(label) {
  cap.$label.set(label);
  bbb.$text.set(`Record Examples (class ${label})`);
  const numExamples = trainingSet.$countPerClass.value[label];
  ttt.$text.set(
    numExamples ? `Recorded ${numExamples} examples of "${label}"` : 'Waiting for examples...',
  );
}

wizard.$current.subscribe((stepIndex) => {
  if (stepIndex === 0) {
    configureWizard('A');
  } else if (stepIndex === 1) {
    configureWizard('B');
  }
});

// -----------------------------------------------------------
// MAIN APP STUFF
// -----------------------------------------------------------

w.$mediastream.subscribe((s) => {
  document.querySelector('#my-webcam').srcObject = s;
});

setTimeout(() => {
  w.$active.set(true);
}, 200);
