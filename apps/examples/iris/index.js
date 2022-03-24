import { dash } from './common';
import { setup as setupData } from './data';
import { setup as setupSimpleScatter } from './simple-scatterplot';
import { setup as setupScatter } from './scatterplot';
import { setup as setupCharts } from './charts';
import { setup as setupTraining } from './training';
import { setup as setupTesting } from './testing';
import { setup as setupBatch } from './batch-prediction';

setupData(dash);
setupSimpleScatter(dash);
setupScatter(dash);
setupCharts(dash);
setupTraining(dash);
setupTesting(dash);
setupBatch(dash);

dash.show();
