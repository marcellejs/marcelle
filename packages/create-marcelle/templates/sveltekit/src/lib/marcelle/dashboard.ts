import { dashboard } from '@marcellejs/layouts';
import { capture, input, label, trainingSetBrowser } from '.';

const dash = dashboard({
  title: 'Marcelle Example - Dashboard',
  author: 'Marcelle Pirates Crew',
  closable: true,
});

dash.page('Data Management').sidebar(input).use([label, capture], trainingSetBrowser);

export function showDashboard() {
  dash.show();
}
