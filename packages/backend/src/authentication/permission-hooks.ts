import { authenticate } from '@feathersjs/authentication';
import { HookContext } from '@feathersjs/feathers';
import { setField } from 'feathers-hooks-common';
import { authorize } from 'feathers-casl';
import { defineAbilitiesFor, User } from '../authentication/authentication.abilities';
import { Application } from '../declarations';
import { allowAnonymous } from './anonymous';
// Don't remove this comment. It's needed to format import lines nicely.

export const authorizeHook = authorize({ adapter: '@feathersjs/mongodb' });

function setAbilitiesForRestProvider(context: HookContext<Application>) {
  if (context.params.provider === 'rest') {
    const { user } = context.params;
    if (user) {
      context.params.ability = defineAbilitiesFor(user as User, context.app as Application);
    }
  }

  return context;
}

export const authReadHooks = (requireAuth: boolean) => {
  if (requireAuth) {
    return [
      allowAnonymous(),
      authenticate('jwt', 'anonymous'),
      setAbilitiesForRestProvider,
      authorizeHook,
    ];
  }
  return [];
};

export const authWriteHooks = (requireAuth: boolean) => {
  if (requireAuth) {
    return [
      authenticate('jwt'),
      setAbilitiesForRestProvider,
      setField({ from: 'params.user._id', as: 'data.userId' }),
      authorizeHook,
    ];
  }
  return [];
};

export const authAfterHooks = (requireAuth: boolean) => {
  if (requireAuth) {
    return [authorizeHook];
  }
  return [];
};
