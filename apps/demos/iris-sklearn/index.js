import { dash } from './common';
import { setup as setupData } from './data';
// import { setup as setupModel } from './model';
import { setup as setupTesting } from './testing';
import { setup as setupBatch } from './batch-prediction';

setupData(dash);
// setupModel(dash);
setupTesting(dash);
setupBatch(dash);

dash.show();
