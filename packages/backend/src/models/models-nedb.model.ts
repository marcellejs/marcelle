import NeDB from 'nedb';
import path from 'path';
import { Application } from '../declarations';

export default function (app: Application, modelType: string): NeDB<any> {
  const dbPath = app.get('nedb');
  const Model = new NeDB({
    filename: path.join(dbPath, `${modelType}-models.db`),
    autoload: true,
  });

  return Model;
}
