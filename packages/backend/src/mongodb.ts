// For more information about this file see https://dove.feathersjs.com/guides/cli/databases.html
import { GridFSBucket, MongoClient } from 'mongodb';
import type { Db } from 'mongodb';
import type { Application } from './declarations';
import { logger } from './logger';

declare module './declarations' {
  interface Configuration {
    mongodb: string;
    mongodbClient: Promise<Db>;
    mongodbBucket: GridFSBucket;
  }
}

export function mongodb(app: Application): void {
  const connection = app.get('mongodb');
  const database = new URL(connection).pathname.substring(1);
  logger.debug(`MongoDb connection: ${connection}`);
  const mongoClient = MongoClient.connect(
    connection,
    // , {useNewUrlParser: true, useUnifiedTopology: true }
  ).then((client) => client.db(database));

  app.set('mongodbClient', mongoClient);

  // Setup GridFS storage
  app.get('mongodbClient').then((db: Db) => {
    const bucket = new GridFSBucket(db, {
      // chunkSizeBytes: 1024,
    });
    app.set('mongodbBucket', bucket);
  });
}
