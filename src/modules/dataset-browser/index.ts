import { DatasetBrowser } from './dataset-browser.module';
import type { Dataset } from '../dataset';

export function datasetBrowser(dataset: Dataset): DatasetBrowser {
  return new DatasetBrowser(dataset);
}

export type { DatasetBrowser };
