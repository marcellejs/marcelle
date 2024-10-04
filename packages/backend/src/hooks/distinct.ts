import { MongoDBService } from '@feathersjs/mongodb';
import { HookContext } from '../declarations';

export async function findDistinct<S extends MongoDBService>(context: HookContext<S>) {
  if (!context.params?.query?.$distinct || context.type !== 'before' || context.method !== 'find') {
    return context;
  }
  const { $distinct, ...query } = context.params.query;

  try {
    const model = await context.service.options.Model;
    context.result = (await model.distinct($distinct, query)) as any;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('An error occurred while calling distinct:', error);
    context.result = [] as any;
  }

  return context;
}
