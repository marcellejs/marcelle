import type { Dataset } from '../../dataset';
import { DatasetBrowser } from './dataset-browser.component';

export function datasetBrowser<InputType>(
  dataset: Dataset<InputType, string>,
): DatasetBrowser<InputType> {
  return new DatasetBrowser<InputType>(dataset);
}

export type { DatasetBrowser };
