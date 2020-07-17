import notify from './core/util/notify';

window.onerror = (message) => {
  if (typeof message === 'string') {
    notify({
      title: 'An error occurred',
      message,
      type: 'danger',
    });
  }
};

window.addEventListener('unhandledrejection', (event) => {
  notify({
    title: 'Oops...',
    message: event.reason,
    type: 'danger',
  });
});
