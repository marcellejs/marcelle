import { DatasetBrowser } from './dataset-browser.component';

export function datasetBrowser(
  ...args: ConstructorParameters<typeof DatasetBrowser>
): DatasetBrowser {
  return new DatasetBrowser(...args);
}

export type { DatasetBrowser };
