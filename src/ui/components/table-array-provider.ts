import { TableDataProvider, TableProviderOptions } from './table-abstract-provider';

export class TableArrayProvider<T extends Record<string, unknown>> extends TableDataProvider<T> {
  rawData: Array<T>;
  private currentPage = 1;

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
    this.currentPage = i;
  }

  async sort(sorting: { col: string; ascending: boolean }): Promise<void> {
    this.rawData.sort((x, y) => {
      if (x[sorting.col] > y[sorting.col]) return sorting.ascending ? 1 : -1;
      if (x[sorting.col] < y[sorting.col]) return sorting.ascending ? -1 : 1;
      return 0;
    });
    this.page(this.currentPage);
  }

  async delete(i: number): Promise<T> {
    this.rawData.splice(i, 1);
    this.page(this.currentPage);
    return null;
  }
}
