/* global marcelle mostCore */

const w = marcelle.webcam();

const cap = marcelle.capture({ input: w.$images, thumbnail: w.$thumbnails });
const mobilenet = marcelle.mobilenet();
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
const trainingSet = marcelle.dataset({ name: 'TrainingSet' });
trainingSet.capture(instances);

const b = marcelle.button({ text: 'Train' });
const classifier = marcelle.mlp({ layers: [128, 64], epochs: 30 });
b.$click.subscribe(() => classifier.train(trainingSet));
classifier.$training.subscribe(console.log);

const tog = marcelle.toggle({ text: 'toggle prediction' });

// ////////////////////////
const d = document.querySelector('#results');
const resultImg = document.querySelector('#result-img');
// ////////////////////////

const results = marcelle.text({ text: 'waiting for predictions...' });
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
        `<h2>predicted label: ${y.label}</h2><p>Confidences: ${Object.values(y.confidences)}</p>`,
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

const bbb = marcelle.button({ text: 'Record Examples (class a)' });
const ttt = marcelle.text({ text: 'Waiting for examples...' });
bbb.$down.subscribe((x) => {
  cap.$capturing.set(x);
});
trainingSet.$countPerClass.subscribe((c) => {
  const label = cap.$label.value;
  ttt.$text.set(`Recorded ${c[label]} examples of "${label}"`);
});

setTimeout(() => {
  w.$active.set(true);
}, 200);

const wizard = marcelle.createWizard();

wizard
  .step()
  .title('Record examples for class A')
  .description('Ich bin ein description')
  .use(w, bbb, ttt);

wizard
  .step()
  .title('Record examples for class B')
  .description('Ich bin ein description')
  .use(w, bbb, ttt);

wizard
  .step()
  .title('Train the model')
  .description('Ich bin ein MLP')
  .use(marcelle.parameters(classifier), b);

wizard
  .step()
  .title('Test the classifier')
  .description('Ich bin ein classifier')
  .use(w, tog, results);

wizard.$current.subscribe((stepIndex) => {
  if (stepIndex === 0) {
    cap.$label.set('A');
    bbb.$text.set('Record Examples (class A)');
    const numExamples = trainingSet.$countPerClass.value.A;
    ttt.$text.set(
      numExamples ? `Recorded ${numExamples} examples of "A"` : 'Waiting for examples...',
    );
  } else if (stepIndex === 1) {
    cap.$label.set('B');
    bbb.$text.set('Record Examples (class B)');
    const numExamples = trainingSet.$countPerClass.value.B;
    ttt.$text.set(
      numExamples ? `Recorded ${numExamples} examples of "B"` : 'Waiting for examples...',
    );
  }
});

const app = marcelle.createApp({
  title: 'Marcelle Starter',
  author: 'Marcelle Pirates Crew',
});

app.dashboard('Data Management').useLeft(w, mobilenet).use(cap, trainingSet);
app.dashboard('Training').use(marcelle.parameters(classifier), b);
app.dashboard('Real-time prediction').useLeft(w).use(tog, results);

// w.mount('my-webcam');
w.$mediastream.subscribe((s) => {
  document.querySelector('#my-webcam').srcObject = s;
});
