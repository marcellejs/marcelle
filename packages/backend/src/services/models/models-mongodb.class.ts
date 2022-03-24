import { Db } from 'mongodb';
import { Service, MongoDBServiceOptions } from 'feathers-mongodb';
import { Application } from '../../declarations';

export class Models extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<MongoDBServiceOptions>, app: Application, modelType: string) {
    super(options);

    const client: Promise<Db> = app.get('mongoClient');

    client.then((db) => {
      this.Model = db.collection(`${modelType}-models`);
    });
  }
}
