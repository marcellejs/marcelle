import { dash } from './common';
import { setup as setupData } from './data';
import { setup as setupModel } from './model';
import { setup as setupTesting } from './testing';
import { setup as setupTesting2 } from './testing-sliders';

setupData(dash);
setupModel(dash);
setupTesting(dash);
setupTesting2(dash);

dash.show();
