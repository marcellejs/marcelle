import { empty } from '@most/core';
import { Stream } from './stream';

export enum LogLevel {
  Debug,
  Info,
  Warning,
  Error,
}

const $log = new Stream<[LogLevel, string]>(empty());

export const logger = {
  log(...messages: unknown[]): void {
    // eslint-disable-next-line no-console
    console.log(...messages);
    $log.set([LogLevel.Info, messages.map((x) => x.toString()).join(' ')]);
  },
  debug(...messages: unknown[]): void {
    $log.set([LogLevel.Debug, messages.map((x) => x.toString()).join(' ')]);
  },
  info(...messages: unknown[]): void {
    this.log(...messages);
  },
  warning(...messages: unknown[]): void {
    $log.set([LogLevel.Warning, messages.map((x) => x.toString()).join(' ')]);
  },
  error(...messages: unknown[]): void {
    // eslint-disable-next-line no-console
    console.error(...messages);
    $log.set([LogLevel.Error, messages.map((x) => x.toString()).join(' ')]);
  },
};

export function getLogStream(): Stream<[LogLevel, string]> {
  return $log;
}
