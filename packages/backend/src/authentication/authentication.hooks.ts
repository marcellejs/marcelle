import { HookContext } from '@feathersjs/feathers';
import { Application } from '../declarations';
import { defineAbilitiesFor } from './authentication.abilities';

function setAbilities(context: HookContext<Application>): HookContext<Application> {
  if (context.result?.anonymous) {
    context.result.user = { role: 'anonymous', _id: null };
  }
  const { user } = context.result;
  if (!user) return context;
  const ability = defineAbilitiesFor(user, context.app as Application);
  context.result.ability = ability;
  context.result.rules = ability.rules;

  return context;
}

function checkEmailVerified(context: HookContext<Application>): HookContext<Application> {
  if (
    context.app.get('authentication')['email-validation']?.enabled &&
    context.app.get('authentication')['email-validation']?.validateEmail &&
    context.result.user?.isVerified === false
  ) {
    const e = new Error('The account has not been verified, check you email');
    e.name = 'EmailUnverified';
    throw e;
  }
  return context;
}

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
    create: [setAbilities, checkEmailVerified],
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
