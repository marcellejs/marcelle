import { AuthenticationBaseStrategy } from '@feathersjs/authentication';
import { NextFunction } from '@feathersjs/feathers';
import { HookContext } from '../declarations';

export class AnonymousStrategy extends AuthenticationBaseStrategy {
  async authenticate() {
    return {
      anonymous: true,
    };
  }
}

export function allowAnonymous() {
  return async (context: HookContext, next?: NextFunction) => {
    const { params } = context;

    if (params.provider && !params.authentication) {
      context.params = {
        ...params,
        authentication: {
          strategy: 'anonymous',
        },
      };
    }

    if (next) {
      await next();
    }

    return context;
  };
}
