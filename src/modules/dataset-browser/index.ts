import type { Dataset } from '../../dataset';
import { DatasetBrowser } from './dataset-browser.module';

export function datasetBrowser(dataset: Dataset): DatasetBrowser {
  return new DatasetBrowser(dataset);
}

export type { DatasetBrowser };
