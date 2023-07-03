import { ObjectId, type GridFSBucket } from 'mongodb';
import type { HookContext } from '../../declarations';

export async function deleteModelFiles(context: HookContext) {
  if (context.id !== undefined) {
    const existing = await context.service.get(context.id);
    const bucket = context.app.get('mongodbBucket') as GridFSBucket;
    for (const x of existing.files) {
      await bucket.delete(new ObjectId(x[1]));
    }
  } else {
    console.log('WARNING: MULTI MODE NOT FULLY IMPLEMENTED, FILES ARE NOT BEING DELETED');
  }
}
