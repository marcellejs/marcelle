import { notification } from './notification';

export { throwError } from './error-handling';
export { notification } from './notification';
export * from './lazy-iterable';
export { mergeDeep } from './object';

if (window) {
  window.onerror = (message) => {
    if (typeof message === 'string') {
      notification({
        title: 'An error occurred',
        message,
        type: 'danger',
      });
    }
  };

  window.addEventListener('unhandledrejection', (event) => {
    notification({
      title: 'An error occurred',
      message: event.reason,
      type: 'danger',
    });
  });
}
