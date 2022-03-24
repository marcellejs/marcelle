import { Application } from '../../declarations';
import { getRegisteredServices } from '../../utils/registered-services';

export default function (app: Application): void {
  app.use('/info', {
    async find() {
      return {
        services: await getRegisteredServices(app),
      };
    },
  });
}
