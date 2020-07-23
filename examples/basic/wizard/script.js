/* global marcelle mostCore */

// -----------------------------------------------------------
// INPUT PIPELINE & CAPTURE TO DATASET
// -----------------------------------------------------------

const w = marcelle.webcam();
const mobilenet = marcelle.mobilenet();

const cap = marcelle.capture({ input: w.$images, thumbnail: w.$thumbnails });
const instances = marcelle.createStream(
  mostCore.awaitPromises(
    mostCore.map(
      async (instance) => ({
        ...instance,
        type: 'image',
        features: await mobilenet.process(instance.data),
      }),
      cap.$instances,
    ),
  ),
);

// const trainingSet = marcelle.dataset({ name: 'TrainingSet' });
const trainingSet = marcelle.dataset({ name: 'TrainingSet', backend: 'localStorage' });
// const trainingSet = marcelle.dataset({ name: 'TrainingSet', backend: 'remote' });
trainingSet.capture(instances);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = marcelle.button({ text: 'Train' });
const classifier = marcelle.mlp({ layers: [128, 64], epochs: 30 });
b.$click.subscribe(() => classifier.train(trainingSet));

const params = marcelle.parameters(classifier);
const prog = marcelle.progress(classifier);

// -----------------------------------------------------------
// PREDICTION
// -----------------------------------------------------------

const tog = marcelle.toggle({ text: 'toggle prediction' });
const results = marcelle.text({ text: 'waiting for predictions...' });

// DOM Stuff for the app
const d = document.querySelector('#results');
const resultImg = document.querySelector('#result-img');

// eslint-disable-next-line @typescript-eslint/no-empty-function
let predictions = { stop() {} };
marcelle.createStream(mostCore.skipRepeats(tog.$checked)).subscribe((x) => {
  if (x) {
    predictions = marcelle.createStream(
      mostCore.awaitPromises(
        mostCore.map(async (img) => classifier.predict(await mobilenet.process(img)), w.$images),
      ),
    );
    let PrevLabel = '';
    predictions.subscribe((y) => {
      results.$text.set(
        `<h2>predicted label: ${y.label}</h2><p>Confidences: ${Object.values(
          y.confidences,
        ).map((z) => z.toFixed(2))}</p>`,
      );
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

const app = marcelle.createApp({
  title: 'Marcelle Starter',
  author: 'Marcelle Pirates Crew',
});

app.dashboard('Data Management').useLeft(w, mobilenet).use(cap, trainingSet);
app.dashboard('Training').use(params, b, prog);
app.dashboard('Real-time prediction').useLeft(w).use(tog, results);

// -----------------------------------------------------------
// WIZARD
// -----------------------------------------------------------

const bbb = marcelle.button({ text: 'Record Examples (class a)' });
const ttt = marcelle.text({ text: 'Waiting for examples...' });
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

const wizard = marcelle.createWizard();

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
