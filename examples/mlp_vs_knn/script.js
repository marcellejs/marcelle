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

// const backend = createBackend({ location: 'http://localhost:3030' });
const backend = createBackend({ location: 'localStorage' });
backend.createService('training');

// const trainingSet = dataset({ name: 'TrainingSet' });
const trainingSet = dataset({ name: 'TrainingSet', backend });
// const trainingSet = dataset({ name: 'TrainingSet', backend: 'remote' });
trainingSet.capture(instances);

const trainingSetBrowser = browser(trainingSet);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = button({ text: 'Train' });
b.name = 'Training Launcher';

// MLP
const classifierMLP = mlp({ layers: [128, 64], epochs: 30 });
b.$click.subscribe(() => {
  classifierMLP.train(trainingSet);
});
const paramsMLP = parameters(classifierMLP);
paramsMLP.name = 'MLP: Parameters';
const progressMLP = progress(classifierMLP);
progressMLP.name = 'MLP: Training Progress';

// KNN
const classifierKNN = knn({ k: 3 });
b.$click.subscribe(() => {
  classifierKNN.train(trainingSet);
});
const paramsKNN = parameters(classifierKNN);
paramsKNN.name = 'KNN: Parameters';
const progressKNN = progress(classifierKNN);
progressKNN.name = 'KNN: Training Progress';

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchMLP = batchPrediction({ name: 'mlp', backend });
const batchKNN = batchPrediction({ name: 'knn', backend });
const predictButton = button({ text: 'Update predictions' });
const predictionAccuracy = text({ text: 'Waiting for predictions...' });
const confusionMLP = confusion(batchMLP);
confusionMLP.name = 'MLP: Confusion Matrix';
const confusionKNN = confusion(batchKNN);
confusionKNN.name = 'KNN: Confusion Matrix';

predictButton.$click.subscribe(async () => {
  await batchMLP.clear();
  await batchMLP.predict(classifierMLP, trainingSet);
  await batchKNN.clear();
  await batchKNN.predict(classifierKNN, trainingSet);
});

createStream(merge(batchMLP.$predictions, batchKNN.$predictions)).subscribe(async () => {
  const { data: predictionsMLP } = await batchMLP.predictionService.find();
  const { data: predictionsKNN } = await batchKNN.predictionService.find();
  const accuracyMLP =
    predictionsMLP
      .map(({ label, trueLabel }) => (label === trueLabel ? 1 : 0))
      .reduce((x, y) => x + y, 0) / predictionsMLP.length;
  const accuracyKNN =
    predictionsKNN
      .map(({ label, trueLabel }) => (label === trueLabel ? 1 : 0))
      .reduce((x, y) => x + y, 0) / predictionsKNN.length;
  predictionAccuracy.$text.set(
    `Global Accuracy (MLP): ${accuracyMLP}<br>Global Accuracy (KNN): ${accuracyKNN}`,
  );
});

// -----------------------------------------------------------
// PREDICTION
// -----------------------------------------------------------

const tog = toggle({ text: 'toggle prediction' });
const results = text({ text: 'waiting for predictions...' });

// DOM Stuff for the app
const d = document.querySelector('#results');
const resultImg = document.querySelector('#result-img');

// eslint-disable-next-line @typescript-eslint/no-empty-function
let predictions = { stop() {} };
createStream(skipRepeats(tog.$checked)).subscribe((x) => {
  if (x) {
    predictions = createStream(
      awaitPromises(map(async (img) => classifierMLP.predict(await m.process(img)), w.$images)),
    );
    let PrevLabel = '';
    predictions.subscribe((y) => {
      results.$text.set(
        `<h2>predicted label: ${y.label}</h2><p>Confidences: ${Object.values(
          y.confidences,
        ).map((z) => z.toFixed(2))}</p>`,
      );
      // backend.service('results').create(y);
      if (y.label !== PrevLabel) {
        d.innerText = `predicted label: ${y.label}`;
        resultImg.src =
          y.label === 'A'
            ? 'https://media.giphy.com/media/zlVf2eSgXIFFuTnEhz/giphy.gif'
            : 'https://media.giphy.com/media/Oc8lIQHZsXqDu/giphy.gif';
        PrevLabel = y.label;
      }
    });
  } else {
    predictions.stop();
  }
});

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dashboard = createDashboard({
  title: 'Marcelle Example - MLP vs KNN',
  author: 'Marcelle Pirates Crew',
  datasets: [trainingSet],
});

dashboard.page('Data Management').useLeft(w, m).use(cap, trainingSetBrowser);
dashboard
  .page('Training')
  .use(
    b,
    'MLP (Multilayer Perceptron)',
    paramsMLP,
    progressMLP,
    'KNN (k-Nearest Neighbors)',
    paramsKNN,
    progressKNN,
  );
dashboard
  .page('Batch Prediction')
  .use(predictButton, predictionAccuracy, [confusionMLP, confusionKNN]);
dashboard.page('Real-time prediction').useLeft(w).use(tog, results);

// -----------------------------------------------------------
// WIZARD
// -----------------------------------------------------------

// const bbb = button({ text: 'Record Examples (class a)' });
// const ttt = text({ text: 'Waiting for examples...' });
// bbb.$down.subscribe((x) => {
//   cap.$capturing.set(x);
// });
// trainingSet.$countPerClass.subscribe((c) => {
//   const label = cap.$label.value;
//   const numExamples = c[label];
//   ttt.$text.set(
//     numExamples ? `Recorded ${numExamples} examples of "${label}"` : 'Waiting for examples...',
//   );
// });

// const wizard = createWizard();

// wizard
//   .step()
//   .title('Record examples for class A')
//   .description('Ich bin ein description')
//   .use(w, bbb, ttt)
//   .step()
//   .title('Record examples for class B')
//   .description('Ich bin ein description')
//   .use(w, bbb, ttt)
//   .step()
//   .title('Train the model')
//   .description('Ich bin ein MLP')
//   .use(b, prog)
//   .step()
//   .title('Test the classifierMLP')
//   .description('Ich bin ein classifierMLP')
//   .use(w, tog, results);

// function configureWizard(label) {
//   cap.$label.set(label);
//   bbb.$text.set(`Record Examples (class ${label})`);
//   const numExamples = trainingSet.$countPerClass.value[label];
//   ttt.$text.set(
//     numExamples ? `Recorded ${numExamples} examples of "${label}"` : 'Waiting for examples...',
//   );
// }

// wizard.$current.subscribe((stepIndex) => {
//   if (stepIndex === 0) {
//     configureWizard('A');
//   } else if (stepIndex === 1) {
//     configureWizard('B');
//   }
// });

// -----------------------------------------------------------
// MAIN APP STUFF
// -----------------------------------------------------------

w.$mediastream.subscribe((s) => {
  document.querySelector('#my-webcam').srcObject = s;
});

setTimeout(() => {
  w.$active.set(true);
}, 200);
