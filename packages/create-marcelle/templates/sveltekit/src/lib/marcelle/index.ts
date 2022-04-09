import '@marcellejs/core/dist/marcelle.css';
import { datasetBrowser, button, dataset, dataStore, textInput, webcam } from '@marcellejs/core';

export const input = webcam();

export const label = textInput();
label.title = 'Instance label';
export const capture = button('Hold to record instances');
capture.title = 'Capture instances to the training set';

const store = dataStore('localStorage');
export const trainingSet = dataset<ImageData, string>('training-set-dashboard', store);
export const trainingSetBrowser = datasetBrowser(trainingSet);

input.$images
  .filter(() => capture.$pressed.value)
  .map((x) => ({ x, y: label.$value.value, thumbnail: input.$thumbnails.value }))
  .subscribe(trainingSet.create);
