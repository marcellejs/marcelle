/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: unknown): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep<T, U>(target: T, ...sources: U[]): T & Partial<U> {
  if (!sources.length) return target as T & Partial<U>;
  const source = sources.shift();

  const result: T & Partial<U> = { ...target } as T & Partial<U>;
  if (isObject(target) && isObject(source)) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in source) {
      if (isObject(source[key])) {
        if (!result[key]) Object.assign(result, { [key]: {} });
        result[key] = mergeDeep(result[key], source[key]);
      } else {
        Object.assign(result, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(result, ...sources);
}
