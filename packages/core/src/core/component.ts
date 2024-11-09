import autoBind from 'auto-bind';
import { BehaviorSubject } from 'rxjs';

let nextId = 0;

export abstract class Component {
  public abstract title: string;

  id = `component-${String(nextId++).padStart(3, '0')}`;

  $loading = new BehaviorSubject(false);

  constructor() {
    autoBind(this);
  }

  abstract mount(target?: HTMLElement): () => void;
}
