import { Toggle } from './toggle.component';

export function toggle(...args: ConstructorParameters<typeof Toggle>): Toggle {
  return new Toggle(...args);
}

export * from './toggle.component';
