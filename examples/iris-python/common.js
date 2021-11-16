import '../../dist/marcelle.css';
import { dashboard, dataStore } from '../../dist/marcelle.esm';

export const store = dataStore('localStorage');

export const dash = dashboard({
  title: 'Iris Classification',
  author: 'Marcelle Doe',
});

dash.settings.dataStores(store);
