import { notification } from '../ui/util/notification';

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
