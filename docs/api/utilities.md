---
sidebarDepth: 3
---

# Utilities

## Logger

Marcelle provides a `logger` utility to display messages in the user interface and/or the console. When a dashboard is mounted, messages are displayed in the footer.

The logger provides serveral functions taking an arbitrary number of messages, similarly to the `console` object:

```tsx
logger.log(...messages: unknown[]): void;
logger.debug(...messages: unknown[]): void;
logger.info(...messages: unknown[]): void;
logger.warning(...messages: unknown[]): void;
logger.error(...messages: unknown[]): void;
```

#### Example

```ts
import { logger } from '@marcellejs/core';

logger.log('Hello Marcelle!');
logger.error('An error occurred with code', 42);
```

## Notifications

```tsx
function notification({
  title: string;
  message: string;
  duration?: number;
  type?: 'default' | 'danger';
}): void
```

Display a notification on the top-right of the screen.

#### Parameters

| Option   | Type                  | Description                                                                                                 | Required |
| -------- | --------------------- | ----------------------------------------------------------------------------------------------------------- | :------: |
| title    | string                | The notification's title                                                                                    |    ✓     |
| message  | string                | The notification's main message                                                                             |    ✓     |
| duration | number                | The notification's duration in milliseconds. If 0, the notification remains on the screen. Defaults to 3000 |    ✓     |
| type     | 'default' \| 'danger' | The notification's type. Defaults to 'default'                                                              |    ✓     |

#### Example

```ts
import { notification } from '@marcellejs/core';

notification({
  title: 'Tip',
  message: 'You need to have at least two classes to train the model',
  duration: 5000,
});
```
