import { JWTStrategy } from '@feathersjs/authentication';
import { Params } from '@feathersjs/feathers';

export class MyJwtStrategy extends JWTStrategy {
  getEntity(id: string, params: Params): Promise<any> {
    if (id === undefined) {
      return Promise.resolve({
        role: 'anonymous',
      });
    }

    return super.getEntity(id, params);
  }
}
