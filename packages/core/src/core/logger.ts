import { Subject } from 'rxjs';

export enum LogLevel {
  Debug,
  Info,
  Warning,
  Error,
}

const $log = new Subject<[LogLevel, string]>();

export const logger = {
  log(...messages: unknown[]): void {
    console.log(...messages);
    $log.next([
      LogLevel.Info,
      messages
        .filter((x) => x !== undefined)
        .map((x) => x.toString())
        .join(' '),
    ]);
  },
  debug(...messages: unknown[]): void {
    $log.next([
      LogLevel.Debug,
      messages
        .filter((x) => x !== undefined)
        .map((x) => x.toString())
        .join(' '),
    ]);
  },
  info(...messages: unknown[]): void {
    this.log(...messages);
  },
  warning(...messages: unknown[]): void {
    $log.next([
      LogLevel.Warning,
      messages
        .filter((x) => x !== undefined)
        .map((x) => x.toString())
        .join(' '),
    ]);
  },
  error(...messages: unknown[]): void {
    console.error(...messages);
    $log.next([
      LogLevel.Error,
      messages
        .filter((x) => x !== undefined)
        .map((x) => x.toString())
        .join(' '),
    ]);
  },
};

export function getLogStream() {
  return $log;
}
