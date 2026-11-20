import '@marcellejs/core/marcelle.css';
import '@marcellejs/gui-widgets/marcelle-gui-widgets.css';
import '@marcellejs/layouts/marcelle-layouts.css';
import { dataStore } from '@marcellejs/core';
import { dashboard } from '@marcellejs/layouts';

export const store = dataStore('localStorage');

export const dash = dashboard({
  title: 'Diabetes Prediction',
  author: 'Marcelle Doe',
});

dash.settings.dataStores(store);
