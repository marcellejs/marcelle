import '@marcellejs/core/dist/marcelle.css';
import '@marcellejs/gui-widgets/dist/marcelle-gui-widgets.css';
import '@marcellejs/layouts/dist/marcelle-layouts.css';
import { datasetBrowser, dataset, dataStore, webcam } from '@marcellejs/core';
import { button, textInput } from '@marcellejs/gui-widgets';
import { filter, from, map, mergeMap, zip } from 'rxjs';

export const input = webcam();

export const label = textInput();
label.title = 'Instance label';
export const capture = button('Hold to record instances');
capture.title = 'Capture instances to the training set';

const store = dataStore('localStorage');
export const trainingSet = dataset('training-set-dashboard', store);
export const trainingSetBrowser = datasetBrowser(trainingSet);

const $instances = zip(input.$images, input.$thumbnails).pipe(
  filter(() => capture.$pressed.getValue()),
  map(async ([x, thumbnail]) => ({
    x,
    y: label.$value.getValue(),
    thumbnail,
  })),
  mergeMap((x) => from(x))
);

$instances.subscribe(trainingSet.create);
