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

// const trainingSet = dataset({ name: 'TrainingSet' });
const trainingSet = dataset({ name: 'TrainingSet', backend: 'localStorage' });
// const trainingSet = dataset({ name: 'TrainingSet', backend: 'remote' });
trainingSet.capture(instances);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = button({ text: 'Train' });
const classifier = mlp({ layers: [128, 64], epochs: 30 });
b.$click.subscribe(() => classifier.train(trainingSet));

const params = parameters(classifier);
const prog = progress(classifier);

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
      awaitPromises(map(async (img) => classifier.predict(await m.process(img)), w.$images)),
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

const dashboard = createDashboard({
  title: 'Marcelle Starter',
  author: 'Marcelle Pirates Crew',
});

dashboard.page('Data Management').useLeft(w, m).use(cap, trainingSet);
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
