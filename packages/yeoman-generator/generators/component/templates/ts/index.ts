import { <%= className %> } from './<%= kebabName %>.component';

export function <%= camelName %>(...args: ConstructorParameters<typeof <%= className %>>): <%= className %> {
  return new <%= className %>(...args);
}

export type { <%= className %> };
