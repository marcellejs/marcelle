import '@marcellejs/core/dist/marcelle.css';
import { text } from '@marcellejs/core';
import { dashboard } from '@marcellejs/layouts';

const x = text('Welcome to Marcelle!');

const dash = dashboard({
  title: 'My Marcelle App!',
  author: 'Marcelle Doe',
});

dash.page('Welcome').use(x);

dash.show();
