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
// TEXT
// -----------------------------------------------------------

const text = marcelle.text({
  text:
    'Just some <strong>HTML</strong> text content... Accepts HTML: <button class="btn">button</button>',
});

// -----------------------------------------------------------
// PLOTTER
// -----------------------------------------------------------

const series1 = marcelle
  .createStream(mostCore.periodic(500))
  .thru(mostCore.map(() => Array.from(Array(12), Math.random)));
const series2 = series1.thru(mostCore.map((x) => x.map((y) => 1 - y + 0.4 * Math.random())));
const plotterExample = marcelle.plotter({
  series: [
    { name: 'series 1', data: series1 },
    { name: 'series 2', data: series2 },
  ],
  options: {
    xaxis: { title: { text: 'x label' } },
    yaxis: { title: { text: 'y label' } },
  },
});

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
  .thru(mostCore.filter(() => capture.$down.value))
  .thru(
    mostCore.map(async (img) => ({
      type: 'image',
      data: img,
      label: label.$text.value,
      thumbnail: webcam.$thumbnails.value,
    })),
  )
  .thru(mostCore.awaitPromises);

const backend = marcelle.createBackend({ location: 'localStorage' });
const trainingSet = marcelle.dataset({ name: 'TrainingSet', backend });
trainingSet.capture(instances);

const trainingSetBrowser = marcelle.browser(trainingSet);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dashboard = marcelle.createDashboard({
  title: 'Marcelle Documentation - Module Showcase',
  author: 'Marcelle Pirates Crew',
});

dashboard.page('Widgets').use(capture, label, tog, text, plotterExample);
dashboard.page('Sources').useLeft(faker, imgDrop, sketch, webcam);
dashboard.page('Data Management').useLeft(webcam).use([label, capture], trainingSetBrowser);
dashboard.settings.use(trainingSet);

dashboard.start();
