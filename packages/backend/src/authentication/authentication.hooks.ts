import { HookContext } from '@feathersjs/feathers';
import { Application } from '../declarations';
import { defineAbilitiesFor } from './authentication.abilities';

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      (context: HookContext): HookContext => {
        delete context.params.user;
        delete context.params.authentication;
        delete context.params.ability;
        delete context.params.rules;

        return context;
      },
    ],
    update: [],
    patch: [],
    remove: [],
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [
      (context: HookContext): HookContext => {
        if (context.result?.anonymous) {
          context.result.user = { role: 'anonymous', _id: null };
        }
        const { user } = context.result;
        if (!user) return context;
        const ability = defineAbilitiesFor(user, context.app as Application);
        context.result.ability = ability;
        context.result.rules = ability.rules;

        return context;
      },
    ],
    update: [],
    patch: [],
    remove: [],
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
