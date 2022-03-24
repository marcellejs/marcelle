import { <%= className %>, <%= className %>Options } from './<%= kebabName %>.component';

export function <%= camelName %>(options: <%= className %>Options): <%= className %> {
  return new <%= className %>(options);
}

export type { <%= className %> };
