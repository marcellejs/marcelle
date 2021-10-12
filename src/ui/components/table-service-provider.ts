import { Paginated, Query, Service } from '@feathersjs/feathers';
import { get } from 'svelte/store';
import { ObjectId } from '../../core';
import { TableDataProvider, TableProviderOptions } from './table-abstract-provider';
import { Column } from './table-types';

export interface ServiceProviderItem {
  id?: ObjectId;
  [key: string]: unknown;
}

export interface TableServiceProviderOptions<T> extends TableProviderOptions {
  service: Service<T>;
  columns?: Column[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform?: Record<string, (...args: any[]) => any>;
}

export class TableServiceProvider<
  T extends ServiceProviderItem = ServiceProviderItem,
> extends TableDataProvider<T> {
  service: Service<T>;
  query: Query;
  transform: TableServiceProviderOptions<T>['transform'];

  constructor({ service, columns, transform, ...options }: TableServiceProviderOptions<T>) {
    super(options);
    this.service = service;
    this.transform = transform || {};
    this.query = {
      $sort: {
        updatedAt: -1,
      },
      $limit: this.options.itemsPerPage,
    };
    if (columns) {
      this.query.$select = columns.map((x) => x.name).concat(['id']);
    }
    this.update();
    this.service.on('created', this.update.bind(this));
    this.service.on('patched', this.update.bind(this));
    this.service.on('updated', this.update.bind(this));
    this.service.on('removed', this.update.bind(this));
  }

  paginate(n: number): void {
    super.paginate(n);
    this.query.$limit = this.options.itemsPerPage;
    this.update();
  }

  async update(): Promise<void> {
    try {
      const res = (await this.service.find({ query: this.query })) as Paginated<T>;
      const data = res.data.map((x, i) => {
        const z = Object.entries(this.transform)
          .map(([target, f]) => {
            try {
              return { [target]: f(x, i) };
            } catch (error) {
              return { [target]: 'transform error' };
            }
          })
          .reduce((o, y) => ({ ...o, ...y }), {});
        return { ...x, ...z };
      });
      this.data.set(data);
      this.total.set(res.total);
      console.log('res.total', res.total);
      this.error.set(null);
    } catch (error) {
      this.data.set([]);
      this.total.set(0);
      this.error.set(error as Error);
    }
  }

  async page(i: number): Promise<void> {
    this.query.$skip = (i - 1) * this.query.$limit;
    this.update();
  }

  async sort(sorting: { col: string; ascending: boolean }): Promise<void> {
    const { col, ascending } = sorting;
    if (col) {
      this.query.$sort = {
        [col]: ascending ? 1 : -1,
      };
    } else {
      delete this.query.$sort;
    }
    this.update();
  }

  async delete(i: number): Promise<T> {
    const removed = get(this.data)[i];
    await this.service.remove(removed.id);
    this.update();
    return removed;
  }
}
