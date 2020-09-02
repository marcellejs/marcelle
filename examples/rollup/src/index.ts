import {
  browser,
  webcam,
  mobilenet,
  capture,
  createStream,
  dataset,
  button,
  parameters,
  progress,
  toggle,
  text,
  mlp,
  createBackend,
  createDashboard,
  createWizard,
  MLPResults,
  Stream,
  Instance,
} from 'marcellejs';
import { awaitPromises, map, skipRepeats } from '@most/core';

// -----------------------------------------------------------
// INPUT PIPELINE & CAPTURE TO DATASET
// -----------------------------------------------------------

const w = webcam();
const m = mobilenet();

const cap = capture({ input: w.$images, thumbnail: w.$thumbnails });
const instances = createStream(
  awaitPromises(
    map(
      async (instance: Instance): Promise<Instance> => ({
        ...instance,
        type: 'image',
        features: await m.process(instance.data as ImageData),
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
const resultImg: HTMLImageElement = document.querySelector('#result-img');

// eslint-disable-next-line @typescript-eslint/no-empty-function
let predictions: Stream<MLPResults>;
createStream(skipRepeats(tog.$checked)).subscribe((x: boolean) => {
  if (x) {
    predictions = createStream(
      awaitPromises(
        map(async (img) => classifier.predict((await m.process(img)) as number[][]), w.$images),
      ),
    );
    let PrevLabel = '';
    predictions.subscribe((y: MLPResults) => {
      results.$text.set(
        `<h2>predicted label: ${y.label}</h2><p>Confidences: ${Object.values(
          y.confidences,
        ).map((z: number) => z.toFixed(2))}</p>`,
      );
      if (y.label !== PrevLabel) {
        d.innerHTML = `predicted label: ${y.label}`;
        resultImg.src =
          y.label === 'A'
            ? 'https://media.giphy.com/media/zlVf2eSgXIFFuTnEhz/giphy.gif'
            : 'https://media.giphy.com/media/Oc8lIQHZsXqDu/giphy.gif';
        PrevLabel = y.label;
      }
    });
  } else {
    predictions?.stop();
  }
});

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const app = createDashboard({
  title: 'Marcelle Starter',
  author: 'Marcelle Pirates Crew',
});

app.page('Data Management').useLeft(w, m).use(cap, trainingSetBrowser);
app.page('Training').use(params, b, prog);
app.page('Real-time prediction').useLeft(w).use(tog, results);

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

function configureWizard(label: string) {
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
  (document.querySelector('#my-webcam') as HTMLVideoElement).srcObject = s;
});

setTimeout(() => {
  w.$active.set(true);
}, 200);

document.querySelector('#start-wizard').addEventListener('click', () => {
  wizard.start();
});

document.querySelector('#start-dashboard').addEventListener('click', () => {
  app.start();
});
