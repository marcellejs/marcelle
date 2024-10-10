import '@marcellejs/core/dist/marcelle.css';
import { dashboard, dataStore } from '@marcellejs/core';

export const store = dataStore('localStorage');

export const dash = dashboard({
  title: 'Diabetes Prediction',
  author: 'Marcelle Doe',
});

dash.settings.dataStores(store);
