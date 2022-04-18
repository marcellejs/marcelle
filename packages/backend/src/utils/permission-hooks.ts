import * as authentication from '@feathersjs/authentication';
import { Hook } from '@feathersjs/feathers';
import { setField } from 'feathers-authentication-hooks';
import { authorize } from 'feathers-casl/dist/hooks';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export const authHooks = (requireAuth: boolean): Hook[] => {
  if (requireAuth) {
    return [authenticate('jwt'), authorize({ adapter: 'feathers-mongodb' })];
  }
  return [];
};

export const authCreateHooks = (requireAuth: boolean): Hook[] => {
  if (requireAuth) {
    return [
      authenticate('jwt'),
      setField({ from: 'params.user._id', as: 'data.userId' }),
      authorize({ adapter: 'feathers-mongodb' }),
    ];
  }
  return [];
};
