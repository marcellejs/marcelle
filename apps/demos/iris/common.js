import '@marcellejs/core/dist/marcelle.css';
import '@marcellejs/gui-widgets/dist/marcelle-gui-widgets.css';
import '@marcellejs/layouts/dist/marcelle-layouts.css';
import { dataStore } from '@marcellejs/core';
import { dashboard } from '@marcellejs/layouts';

export const store = dataStore('localStorage');

export const dash = dashboard({
  title: 'Iris Classification',
  author: 'Marcelle Doe',
});

dash.settings.dataStores(store);
