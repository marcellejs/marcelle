import * as authentication from '@feathersjs/authentication';
import { Hook, HookContext } from '@feathersjs/feathers';
import { setField } from 'feathers-authentication-hooks';
import { authorize } from 'feathers-casl/dist/hooks';
import { defineAbilitiesFor, User } from '../authentication/abilities';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

function setAbilitiesForRestProvider(context: HookContext) {
  if (context.params.provider === 'rest') {
    const { user } = context.params;
    if (user) {
      context.params.ability = defineAbilitiesFor(user as User, context.app);
    }
  }
  return context;
}

export const authReadHooks = (requireAuth: boolean): Hook[] => {
  if (requireAuth) {
    return [
      authenticate('jwt'),
      setAbilitiesForRestProvider,
      authorize({ adapter: 'feathers-mongodb' }),
    ];
  }
  return [];
};

export const authWriteHooks = (requireAuth: boolean): Hook[] => {
  if (requireAuth) {
    return [
      authenticate('jwt'),
      setAbilitiesForRestProvider,
      setField({ from: 'params.user._id', as: 'data.userId' }),
      authorize({ adapter: 'feathers-mongodb' }),
    ];
  }
  return [];
};
