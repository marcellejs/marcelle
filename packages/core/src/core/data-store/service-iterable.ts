import type { Paginated, Params, Service } from '@feathersjs/feathers';
import { mergeDeep } from '../../utils';
import { LazyIterable } from '../../utils/lazy-iterable/lazy-iterable';

interface ServiceIterableParams {
  query: Params['query'];
  skip: number;
  take: number;
}

export class ServiceIterable<T> extends LazyIterable<T> {
  params: ServiceIterableParams;

  constructor(
    private readonly service: Service<T>,
    params: Partial<ServiceIterableParams> = {},
  ) {
    super(async function* () {
      const p = { query: {}, skip: 0, take: -1, ...params };
      const take = p.take;
      let took = 0;
      let buffer: T[] = [];
      const nextQuery = {
        ...p.query,
        $skip: p.skip,
        $limit: 10,
      };

      while (true) {
        try {
          if (take > 0 && took >= take) {
            return;
          }
          took++;
          if (buffer.length > 0) {
            const value = buffer.shift();
            yield value;
          } else {
            const found = (await service.find({ query: nextQuery })) as Paginated<T>;
            nextQuery.$skip = found.skip + found.limit;
            buffer = found.data;
            if (buffer.length > 0) {
              const value = buffer.shift();
              yield value;
            } else {
              return;
            }
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          // Modify the error message but leave the stack trace intact
          e.message = `Error thrown while iterating through a service: ${e.message}`;
          throw e;
        }
      }
    });
    this.params = { query: {}, skip: 0, take: -1, ...params };
  }

  skip(n: number): ServiceIterable<T> {
    return new ServiceIterable(this.service, { ...this.params, skip: n });
  }

  take(n: number): ServiceIterable<T> {
    return new ServiceIterable(this.service, { ...this.params, take: n });
  }

  select(fields: string[]): ServiceIterable<T> {
    const p = structuredClone(this.params);
    // const p = cloneDeep(this.params); !!! Initially from LODASH
    p.query.$select = fields;
    return new ServiceIterable(this.service, p);
  }

  query(q: Params['query']): ServiceIterable<T> {
    return new ServiceIterable(this.service, mergeDeep(this.params, { query: q }));
  }
}

export function iterableFromService<T>(service: Service<T>): ServiceIterable<T> {
  return new ServiceIterable(service);
}
