/* global marcelle, mostCore */

// -----------------------------------------------------------
// BUTTON
// -----------------------------------------------------------

const capture = marcelle.button({ text: 'Hold to record instances' });
capture.name = 'Capture instances to the training set';

capture.$click.subscribe((x) => console.log('button $click:', x));

// -----------------------------------------------------------
// TEXTFIELD
// -----------------------------------------------------------

const label = marcelle.textfield();
label.name = 'Instance label';

label.$text.subscribe((x) => console.log('label $text:', x));
setTimeout(() => {
  label.$text.set('myLabel');
}, 1000);

// -----------------------------------------------------------
// TOGGLE
// -----------------------------------------------------------

const tog = marcelle.toggle({ text: 'Toggle Real-Time Prediction' });
tog.$checked.subscribe((x) => console.log('toggle $checked:', x));

// -----------------------------------------------------------
// SELECT
// -----------------------------------------------------------

const sel = marcelle.select({ options: ['one', 'two', 'three'], value: 'two' });
sel.$value.subscribe((x) => console.log('sel $value:', x));

// -----------------------------------------------------------
// TEXT
// -----------------------------------------------------------

const text = marcelle.text({
  text:
    'Just some <strong>HTML</strong> text content... Accepts HTML: <button class="btn">button</button>',
});

// -----------------------------------------------------------
// SLIDER
// -----------------------------------------------------------

const slider = marcelle.slider({
  values: [2, 8],
  min: 0,
  max: 10,
  pips: true,
  step: 1,
  range: true,
});
slider.$values.subscribe((x) => console.log('slider $values:', x));

// -----------------------------------------------------------
// CHART
// -----------------------------------------------------------

const series1 = marcelle
  .createStream(mostCore.periodic(500))
  .map(() => Array.from(Array(12), Math.random));
const series2 = series1.map((x) => x.map((y) => 1 - y + 0.4 * Math.random()));
const chartExample = marcelle.chart({
  options: {
    xlabel: 'x label',
    ylabel: 'y label',
  },
});
chartExample.addSeries(series1, 'series 1');
chartExample.addSeries(series2, 'series 2');

// -----------------------------------------------------------
// FAKER
// -----------------------------------------------------------

const faker = marcelle.faker({ size: 12, period: 500 });
faker.$frames.subscribe((x) => console.log('faker $frames:', x));

// -----------------------------------------------------------
// IMAGEDROP
// -----------------------------------------------------------

const imgDrop = marcelle.imageDrop();
imgDrop.$images.subscribe((x) => console.log('imageDrop $images:', x));

// -----------------------------------------------------------
// SKETCHPAD
// -----------------------------------------------------------

const sketch = marcelle.sketchpad();
sketch.$strokeStart.subscribe(() => console.log('imageDrop $strokeStart'));
sketch.$strokeEnd.subscribe(() => console.log('imageDrop $strokeEnd'));

// -----------------------------------------------------------
// WEBCAM
// -----------------------------------------------------------

const webcam = marcelle.webcam();
webcam.$images.subscribe((x) => console.log('webcam $images:', x));

// -----------------------------------------------------------
// DATASET
// -----------------------------------------------------------

const instances = webcam.$images
  .filter(() => capture.$down.value)
  .map(async (img) => ({
    type: 'image',
    data: img,
    label: label.$text.value,
    thumbnail: webcam.$thumbnails.value,
  }))
  .awaitPromises();

const store = marcelle.dataStore({ location: 'localStorage' });
const trainingSet = marcelle.dataset({ name: 'TrainingSet', dataStore: store });
trainingSet.capture(instances);

const trainingSetBrowser = marcelle.browser(trainingSet);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dashboard = marcelle.dashboard({
  title: 'Marcelle Documentation - Module Showcase',
  author: 'Marcelle Pirates Crew',
});

dashboard.page('Widgets').use(capture, label, tog, sel, text, slider, chartExample);
dashboard.page('Sources').useLeft(faker, imgDrop, sketch, webcam);
dashboard.page('Data Management').useLeft(webcam).use([label, capture], trainingSetBrowser);
dashboard.settings.use(trainingSet);

dashboard.start();
