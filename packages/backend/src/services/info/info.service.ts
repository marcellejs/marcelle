import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { getRegisteredServices } from '../../utils/registered-services';

class InfoService {
  constructor(public app: Application) {}

  async find() {
    return {
      services: await getRegisteredServices(this.app),
    };
  }
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    info: InfoService & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  app.use('/info', new InfoService(app));
}
