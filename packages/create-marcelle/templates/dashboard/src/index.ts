import '@marcellejs/core/marcelle.css';
import '@marcellejs/gui-widgets/marcelle-gui-widgets.css';
import '@marcellejs/layouts/marcelle-layouts.css';
import { text } from '@marcellejs/gui-widgets';
import { dashboard } from '@marcellejs/layouts';

const x = text('Welcome to Marcelle!');

const dash = dashboard({
  title: 'My Marcelle App!',
  author: 'Me',
});

dash.page('Welcome').use(x);

dash.show();
