import { Todo } from './todo.component';

export function todo(...args: ConstructorParameters<typeof Todo>): Todo {
  return new Todo(...args);
}

export type { Todo };
