// import { existsSync, readdirSync } from 'fs';
// import { extname, parse } from 'path';
import { Application } from '../declarations';

export async function getRegisteredServices(app: Application): Promise<string[]> {
  // if (app.get('database') === 'mongodb') {
  const db = await app.get('mongodbClient');
  const collections = await db.collections();
  return collections.map((x) => x.collectionName).filter((x) => x !== 'authentication');
  // } else if (app.get('database') === 'nedb') {
  //   const dbPath = app.get('nedb');
  //   if (existsSync(dbPath)) {
  //     const files = readdirSync(dbPath);
  //     return files
  //       .filter((f) => extname(f) === '.db')
  //       .map((x) => parse(x).name)
  //       .filter((x) => x !== 'authentication');
  //   }
  //   return [];
  // } else {
  //   throw new Error('Invalid database type: only "nedb" or "mongodb" are currently supported');
  // }
}
