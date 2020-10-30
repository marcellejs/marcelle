import { Browser } from './browser.module';
import type { Dataset } from '../dataset';

export function browser(dataset: Dataset): Browser {
  return new Browser(dataset);
}

export type { Browser };
