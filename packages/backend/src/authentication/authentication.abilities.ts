// import { makeAbilityFromRules } from 'feathers-casl';
import { createMongoAbility, AbilityBuilder, createAliasResolver } from '@casl/ability';
import { Application } from '../declarations';

// don't forget this, as `read` is used internally
const resolveAction = createAliasResolver({
  update: 'patch', // define the same rules for update & patch
  read: ['get', 'find'], // use 'read' as a equivalent for 'get' & 'find'
  delete: 'remove', // use 'delete' or 'remove'
});

export interface User {
  _id: string;
  role?: string;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const defineRulesFor = (user: User, app: Application) => {
  // also see https://casl.js.org/v6/en/guide/define-rules
  const { can, cannot, rules } = new AbilityBuilder(createMongoAbility);

  if (user.role === 'SuperAdmin') {
    // SuperAdmin can do evil
    can('manage', 'all');
    return rules;
  }

  can('read', 'all', { public: true });
  can('manage', 'all', { userId: user._id });

  const usersPath = app.getServicePath(app.get('authentication').service as 'users');
  if (app.get('authentication').allowSignup) {
    can('create', usersPath);
  } else {
    cannot('create', usersPath);
  }

  can('read', usersPath);
  can('update', usersPath, { _id: user._id });
  cannot('update', usersPath, ['role'], { _id: user._id });
  cannot('delete', usersPath, { _id: user._id });

  if (user.role === 'Admin') {
    can('manage', usersPath);
  }

  return rules;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const defineAbilitiesFor = (user: User, app: Application) => {
  const rules = defineRulesFor(user, app);

  return createMongoAbility(rules, { resolveAction });
};
