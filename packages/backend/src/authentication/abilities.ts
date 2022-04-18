import { createAliasResolver, makeAbilityFromRules } from 'feathers-casl';
import { AbilityBuilder, Ability } from '@casl/ability';
import { Application } from '@feathersjs/feathers';

// don't forget this, as `read` is used internally
const resolveAction = createAliasResolver({
  update: 'patch', // define the same rules for update & patch
  read: ['get', 'find'], // use 'read' as a equivalent for 'get' & 'find'
  delete: 'remove', // use 'delete' or 'remove'
});

interface User {
  _id: string;
  role?: string;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const defineRulesFor = (user: User, app: Application) => {
  // also see https://casl.js.org/v5/en/guide/define-rules
  const { can, cannot, rules } = new AbilityBuilder(Ability);

  if (user.role === 'SuperAdmin') {
    // SuperAdmin can do evil
    can('manage', 'all');
    return rules;
  }

  can('read', 'all', { public: true });
  can('manage', 'all', { userId: user._id });

  if (app.get('authentication').allowSignup) {
    can('create', 'users');
  } else {
    cannot('create', 'users');
  }

  can('read', 'users');
  can('update', 'users', { _id: user._id });
  cannot('update', 'users', ['role'], { _id: user._id });
  cannot('delete', 'users', { _id: user._id });

  if (user.role === 'Admin') {
    can('manage', 'users');
  }

  return rules;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const defineAbilitiesFor = (user: User, app: Application) => {
  const rules = defineRulesFor(user, app);

  return makeAbilityFromRules(rules, { resolveAction });
};
