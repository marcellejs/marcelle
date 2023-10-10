import '@marcellejs/core/dist/marcelle.css';
import {
  dashboard,
  imageUpload,
  confidencePlot,
  select,
  imageDisplay,
  tfjsModel,
} from '@marcellejs/core';
import { from, map, merge, mergeMap, withLatestFrom } from 'rxjs';
import { gradcam } from './components';
import imagenet_labs from './imagenet_class_index.json';
import { preprocessImage } from './preprocess_image';
const labels = Object.values(imagenet_labs).map((x) => x[1]);

const input = imageUpload({ width: 224, height: 224 });

const classifier = tfjsModel({
  inputType: 'generic',
  taskType: 'classification',
});
classifier.loadFromUrl('/mobilenet_v2/model.json');
// classifier.labels = labels;

// -----------------------------------------------------------
// SINGLE IMAGE PREDICTION
// -----------------------------------------------------------

const gc = gradcam();

classifier.$training.subscribe(({ status }) => {
  if (status === 'loaded') {
    gc.setModel(classifier.model);
    gc.selectLayer();
  }
});

const topK = 10;
const $inputStream = input.$images.pipe(
  map(preprocessImage({ preset: 'keras:mobilenet_v2' })),
  mergeMap((x) => from(x)),
);
const $predictions = $inputStream.pipe(
  mergeMap((img) => from(classifier.predict(img))),
  map(({ label, confidences }) => {
    const conf = Object.entries(confidences)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK);
    return {
      label: labels[parseInt(label, 10)],
      confidences: conf.reduce((x, y) => ({ ...x, [labels[parseInt(y[0])]]: y[1] }), {}),
    };
  }),
);

const selectClass = select(labels);
$predictions.subscribe(({ label, confidences }) => {
  selectClass.$options.next(Object.keys(confidences));
  selectClass.$value.next(label);
});

const plotResults = confidencePlot($predictions);

$inputStream.subscribe((x) => console.log('$inputStream', x));
merge($predictions, selectClass.$value).subscribe((x) => console.log('merge', x));
merge($predictions, selectClass.$value)
  .pipe(withLatestFrom($inputStream))
  .subscribe((x) => console.log('withLatestFrom', x));

const gcDisplay = [
  imageDisplay(input.$images),
  imageDisplay(
    merge($predictions, selectClass.$value).pipe(
      withLatestFrom($inputStream),
      map(([, img]) => gc.explain(img, labels.indexOf(selectClass.$value.getValue()))),
      mergeMap((x) => from(x)),
    ),
  ),
];

const dash = dashboard({
  title: 'Marcelle: Grad-CAM Example',
  author: 'Marcelle Pirates Crew',
});

dash.page('Main').sidebar(input, classifier).use(plotResults, selectClass, gcDisplay);

dash.show();
