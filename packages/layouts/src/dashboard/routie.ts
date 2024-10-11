/* eslint-disable no-param-reassign */
/* eslint-disable max-classes-per-file */
// Simple router inspired by Routie: https://github.com/jgallen23/routie
interface RoutieKey {
  name: string;
  optional: boolean;
}
type RoutieParams = unknown[];
type RoutieCallback = (...params: RoutieParams) => void;

function pathToRegexp(
  path: RegExp | string[] | string,
  keys: RoutieKey[],
  sensitive: boolean,
  strict: boolean,
): RegExp {
  if (path instanceof RegExp) return path;
  if (path instanceof Array) path = `(${path.join('|')})`;
  path = path
    .concat(strict ? '' : '/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/\+/g, '__plus__')
    .replace(
      /(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g,
      (
        _: unknown,
        slash: string,
        format: string,
        key: string,
        capture: string,
        optional: boolean,
      ) => {
        keys.push({ name: key, optional: !!optional });
        slash = slash || '';
        return `${optional ? '' : slash}(?:${optional ? slash : ''}${format || ''}${
          capture || (format && '([^/.]+?)') || '([^/]+?)'
        })${optional || ''}`;
      },
    )
    .replace(/([/.])/g, '\\$1')
    .replace(/__plus__/g, '(.+)')
    .replace(/\*/g, '(.*)');
  return new RegExp(`^${path}$`, sensitive ? '' : 'i');
}

class Route {
  keys: RoutieKey[] = [];
  fns: RoutieCallback[] = [];
  params: Record<string, string> = {};
  regex: RegExp;

  constructor(
    public path: string,
    public name: string,
  ) {
    this.regex = pathToRegexp(this.path, this.keys, false, false);
  }

  addHandler(fn: RoutieCallback): void {
    this.fns.push(fn);
  }

  removeHandler(fn: RoutieCallback): void {
    this.fns = this.fns.filter((f: RoutieCallback) => fn === f);
  }

  run(params: RoutieParams) {
    for (const fn of this.fns) {
      fn.apply(this, params);
    }
  }

  match(path: string, params: RoutieParams): boolean {
    const m = this.regex.exec(path);
    if (!m) return false;

    for (let i = 1, len = m.length; i < len; i++) {
      const key = this.keys[i - 1];
      const val = typeof m[i] === 'string' ? decodeURIComponent(m[i]) : m[i];

      if (key) {
        this.params[key.name] = val;
      }
      params.push(val);
    }

    return true;
  }
}

function checkRoute(hash: string, route: Route) {
  const params: RoutieParams = [];
  if (route.match(hash, params)) {
    route.run(params);
    return true;
  }
  return false;
}

export default class Router {
  map: Record<string, Route> = {};
  routes: Route[] = [];

  constructor() {
    this.addListener();
  }

  route(path: string, fn: RoutieCallback): void {
    const s = path.split(' ');
    const name = s.length === 2 ? s[0] : null;
    path = s.length === 2 ? s[1] : s[0];

    if (!Object.keys(this.map).includes(path)) {
      this.map[path] = new Route(path, name);
      this.routes.push(this.map[path]);
    }
    this.map[path].addHandler(fn);
    this.reload();
  }

  addListener(): void {
    window.addEventListener('hashchange', this.reload.bind(this), false);
  }

  removeListener(): void {
    window.removeEventListener('hashchange', this.reload.bind(this));
  }

  reload(): void {
    const hash = window.location.hash.substring(1);
    for (const route of this.routes) {
      if (checkRoute(hash, route)) {
        return;
      }
    }
  }

  navigate(path: string, { silent = false } = {}): void {
    if (silent) {
      this.removeListener();
    }
    setTimeout(() => {
      window.location.hash = path;
      if (silent) {
        setTimeout(() => {
          this.addListener();
        }, 1);
      }
    }, 1);
  }
}
