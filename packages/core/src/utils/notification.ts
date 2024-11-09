import { mount } from 'svelte';
import Notification from './design-system/Notification.svelte';

let notificationContainer: HTMLDivElement | undefined;
let app: {
  $on?(type: string, callback: (e: any) => void): () => void;
  $set?(props: Partial<Record<string, any>>): void;
} & Record<string, any>;

export function notification({
  title,
  message,
  duration = 3000,
  type = 'default',
}: {
  title: string;
  message: string;
  duration?: number;
  type?: 'default' | 'danger';
}): void {
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    document.body.appendChild(notificationContainer);
    app = mount(Notification, {
      target: notificationContainer,
    });
  }
  app?.add({ title, message, duration, type });
}

export function setupGlobalErrorNotifications(unhandledPromises = true) {
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

    if (unhandledPromises) {
      window.addEventListener('unhandledrejection', (event) => {
        notification({
          title: 'An error occurred',
          message: event.reason,
          type: 'danger',
        });
      });
    }
  }
}
