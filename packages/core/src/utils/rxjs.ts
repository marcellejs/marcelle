import type { BehaviorSubject as RxSubject } from 'rxjs';

interface BindableSubject<T> extends RxSubject<T> {
  set(t: T): void;
}

export function rxBind<T>(s: RxSubject<T>) {
  const res = s as BindableSubject<T>;
  res.set = res.next.bind(res);
  return res;
}
