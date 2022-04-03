import NeDB from 'nedb';
import path from 'path';
import { Application } from '../declarations';

export default function (app: Application, name: string): NeDB<any> {
  const dbPath = app.get('nedb');
  const Model = new NeDB({
    filename: path.join(dbPath, `${name}.db`),
    autoload: true,
  });

  // Set NeDb auto-compaction interval
  // https://github.com/louischatriot/nedb#persistence
  Model.persistence.setAutocompactionInterval(30000);

  return Model;
}
