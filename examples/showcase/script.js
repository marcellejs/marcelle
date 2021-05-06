/* eslint-disable no-console */
import '../../dist/marcelle.css';
import {
  datasetBrowser,
  button,
  genericChart,
  dashboard,
  dataset,
  dataStore,
  imageUpload,
  select,
  sketchPad,
  slider,
  Stream,
  text,
  textField,
  toggle,
  webcam,
} from '../../dist/marcelle.esm';

// -----------------------------------------------------------
// BUTTON
// -----------------------------------------------------------

const capture = button({ text: 'Hold to record instances' });
capture.title = 'Capture instances to the training set';

capture.$click.subscribe((x) => console.log('button $click:', x));

// -----------------------------------------------------------
// TEXTFIELD
// -----------------------------------------------------------

const label = textField();
label.title = 'Instance label';

label.$text.subscribe((x) => console.log('label $text:', x));
setTimeout(() => {
  label.$text.set('myLabel');
}, 1000);

// -----------------------------------------------------------
// TOGGLE
// -----------------------------------------------------------

const tog = toggle({ text: 'Toggle Real-Time Prediction' });
tog.$checked.subscribe((x) => console.log('toggle $checked:', x));

// -----------------------------------------------------------
// SELECT
// -----------------------------------------------------------

const sel = select({ options: ['one', 'two', 'three'], value: 'two' });
sel.$value.subscribe((x) => console.log('sel $value:', x));

// -----------------------------------------------------------
// TEXT
// -----------------------------------------------------------

const t = text({
  text:
    'Just some <strong>HTML</strong> text content... Accepts HTML: <button class="btn">button</button>',
});

// -----------------------------------------------------------
// SLIDER
// -----------------------------------------------------------

const s = slider({
  values: [2, 8],
  min: 0,
  max: 10,
  pips: true,
  step: 1,
  range: true,
});
s.$values.subscribe((x) => console.log('slider $values:', x));

// -----------------------------------------------------------
// CHART
// -----------------------------------------------------------

const series1 = Stream.periodic(500).map(() => Array.from(Array(12), Math.random));
const series2 = series1.map((x) => x.map((y) => 1 - y + 0.4 * Math.random()));
const chartExample = genericChart({
  options: {
    xlabel: 'x label',
    ylabel: 'y label',
  },
});
chartExample.addSeries(series1, 'series 1');
chartExample.addSeries(series2, 'series 2');

// -----------------------------------------------------------
// IMAGE UPLOAD
// -----------------------------------------------------------

const imgDrop = imageUpload();
imgDrop.$images.subscribe((x) => console.log('imageUpload $images:', x));

// -----------------------------------------------------------
// SKETCHPAD
// -----------------------------------------------------------

const sketch = sketchPad();
sketch.$strokeStart.subscribe(() => console.log('sketchPad $strokeStart'));
sketch.$strokeEnd.subscribe(() => console.log('sketchPad $strokeEnd'));

// -----------------------------------------------------------
// WEBCAM
// -----------------------------------------------------------

const w = webcam();
w.$images.subscribe((x) => console.log('webcam $images:', x));

// -----------------------------------------------------------
// DATASET
// -----------------------------------------------------------

const instances = w.$images
  .filter(() => capture.$down.value)
  .map(async (img) => ({
    type: 'image',
    data: img,
    label: label.$text.value,
    thumbnail: w.$thumbnails.value,
  }))
  .awaitPromises();

const store = dataStore('localStorage');
const trainingSet = dataset('TrainingSet', store);
trainingSet.capture(instances);

const trainingSetBrowser = datasetBrowser(trainingSet);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle Documentation - Module Showcase',
  author: 'Marcelle Pirates Crew',
});

dash.page('Widgets').use(capture, label, tog, sel, t, s, chartExample);
dash.page('Sources').useLeft(imgDrop, sketch, w);
dash.page('Data Management').useLeft(w).use([label, capture], trainingSetBrowser);
dash.settings.dataStores(store).datasets(trainingSet);

dash.start();
