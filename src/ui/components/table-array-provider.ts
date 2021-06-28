import { TableDataProvider, TableProviderOptions } from './table-abstract-provider';

export class TableArrayProvider<T extends Record<string, unknown>> extends TableDataProvider<T> {
  rawData: Array<T>;

  constructor({ data, ...options }: TableProviderOptions & { data: Array<T> }) {
    super(options);
    this.rawData = data;
    this.data.set(this.rawData.slice(0, this.options.itemsPerPage));
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async update(): Promise<void> {}

  async page(i: number): Promise<void> {
    this.data.set(
      this.rawData.slice(
        (i - 1) * this.options.itemsPerPage,
        Math.min(i * this.options.itemsPerPage, this.rawData.length),
      ),
    );
  }

  async sort(sorting: { col: string; ascending: boolean }): Promise<void> {
    console.log('[provider] sort with', sorting);
  }

  async delete(i: number): Promise<T> {
    console.log('[provider] delete item', i);
    return null;
  }
}
