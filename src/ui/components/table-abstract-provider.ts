import { get, writable, Writable } from 'svelte/store';

export interface TableProviderOptions {
  itemsPerPage?: number;
}

const defaultOptions = { itemsPerPage: 10 };

export abstract class TableDataProvider<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  options: TableProviderOptions;
  data: Writable<T[]> = writable([]);
  total: Writable<number> = writable(0);
  error: Writable<Error> = writable(null);

  constructor(options: TableProviderOptions = defaultOptions) {
    this.options = { ...defaultOptions, ...options };
  }

  paginate(n: number): void {
    this.options.itemsPerPage = n;
  }

  async get(i: number): Promise<T> {
    const data = get(this.data);
    if (i >= 0 && i < data.length) {
      return data[i];
    }
    return null;
  }

  abstract update(): Promise<void>;
  abstract delete(i: number): Promise<T>;
  abstract page(i: number): Promise<void>;
  abstract sort(sorting: { col: string; ascending: boolean }): Promise<void>;
}
