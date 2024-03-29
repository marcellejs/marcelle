import { createAliasResolver, makeAbilityFromRules } from 'feathers-casl';
import { AbilityBuilder, Ability } from '@casl/ability';
import { Application } from '../declarations';

// don't forget this, as `read` is used internally
const resolveAction = createAliasResolver({
  update: 'patch', // define the same rules for update & patch
  read: ['get', 'find'], // use 'read' as a equivalent for 'get' & 'find'
  delete: 'remove', // use 'delete' or 'remove'
});

// WARNING: This is not a drop in replacement solution and
// it might not work for some edge cases. Test your code!
function get<T>(obj: object, path: string | string[], defValue?: T) {
  // If path is not defined or it has false value
  if (!path) return undefined;
  // Check if path is string or array. Regex : ensure that we do not have '.' and brackets.
  // Regex explained: https://regexr.com/58j0k
  const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);
  // Find value
  const result = pathArray?.reduce((prevObj: any, key) => prevObj && prevObj[key], obj);
  // If found value is undefined return default value; otherwise return the value
  return result === undefined ? defValue : result;
}

function interpolate(template: string, vars: object) {
  return JSON.parse(template, (_, rawValue) => {
    if (rawValue[0] !== '$') {
      return rawValue;
    }

    const name = rawValue.slice(2, -1);
    const value = get(vars, name);

    if (typeof value === 'undefined') {
      throw new ReferenceError(`Variable ${name} is not defined`);
    }

    return value;
  });
}

export interface User {
  _id: string;
  role?: string;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const defineRulesFor = (user: User, app: Application) => {
  // also see https://casl.js.org/v5/en/guide/define-rules
  const { can, cannot, rules } = new AbilityBuilder(Ability);

  const permissions = app.get('permissions');
  console.log('permissions', permissions);
  if (permissions) {
    if (user.role && Object.keys(permissions).includes(user.role)) {
      try {
        const xx = interpolate(JSON.stringify(permissions[user.role]), {
          user,
          true: true,
          false: false,
        });
        const abs = new Ability(xx);
        return abs.rules;
      } catch (error) {
        console.log(error);
      }
    } else {
      return [];
    }
  }

  if (user.role === 'superadmin') {
    // SuperAdmin can do evil
    can('manage', 'all');
    return rules;
  }

  can('read', 'all', { public: true });
  can('manage', 'all', { userId: user._id });

  const usersPath = '/users';
  if (app.get('authentication').allowSignup) {
    can('create', usersPath);
  } else {
    cannot('create', usersPath);
  }

  can('read', usersPath);
  can(
    'update',
    usersPath, //, { _id: user._id }
  );
  // cannot('update', usersPath, ['role'], { _id: user._id });
  cannot('delete', usersPath, { _id: user._id });

  if (user.role === 'admin') {
    can('manage', usersPath);
  }

  return rules;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const defineAbilitiesFor = (user: User, app: Application) => {
  const rules = defineRulesFor(user, app);

  return makeAbilityFromRules(rules, { resolveAction });
};
