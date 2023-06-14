// For more information about this file see https://dove.feathersjs.com/guides/cli/databases.html
import { MongoClient } from 'mongodb';
import type { Db } from 'mongodb';
import type { Application } from './declarations';

declare module './declarations' {
  interface Configuration {
    mongodb: string;
    mongodbClient: Promise<Db>;
    // TODO:GRIDFS
    // mongoBucket: GridFSBucket;
  }
}

export function mongodb(app: Application): void {
  const connection = app.get('mongodb');
  const database = new URL(connection).pathname.substring(1);
  const mongoClient = MongoClient.connect(
    connection,
    // , {useNewUrlParser: true, useUnifiedTopology: true }
  ).then((client) => client.db(database));

  app.set('mongoClient', mongoClient);

  // TODO:GRIDFS
  // Setup GridFS storage
  // app.get('mongoClient').then((db: Db) => {
  //   const bucket = new GridFSBucket(db, {
  //     chunkSizeBytes: 1024,
  //   });
  //   app.set('mongoBucket', bucket);
  // });
}
