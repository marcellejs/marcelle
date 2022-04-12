import { never } from '@most/core';
import { Stream } from './stream';

export enum LogLevel {
  Debug,
  Info,
  Warning,
  Error,
}

const $log = new Stream<[LogLevel, string]>(never());

export const logger = {
  log(...messages: unknown[]): void {
    // eslint-disable-next-line no-console
    console.log(...messages);
    $log.set([
      LogLevel.Info,
      messages
        .filter((x) => x !== undefined)
        .map((x) => x.toString())
        .join(' '),
    ]);
  },
  debug(...messages: unknown[]): void {
    $log.set([
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
    $log.set([
      LogLevel.Warning,
      messages
        .filter((x) => x !== undefined)
        .map((x) => x.toString())
        .join(' '),
    ]);
  },
  error(...messages: unknown[]): void {
    // eslint-disable-next-line no-console
    console.error(...messages);
    $log.set([
      LogLevel.Error,
      messages
        .filter((x) => x !== undefined)
        .map((x) => x.toString())
        .join(' '),
    ]);
  },
};

export function getLogStream(): Stream<[LogLevel, string]> {
  return $log;
}
