import { logger } from '../core/logger';
import { notification } from './notification';

export function Catch(
  target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor,
): PropertyDescriptor {
  const originalMethod = descriptor.value;

  descriptor.value = function safeMethod(...args: unknown[]): unknown {
    try {
      return originalMethod.apply(this, args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(error);
      notification({
        title: error.name,
        message: error.message,
        type: 'danger',
      });
      return error;
    }
  };

  return descriptor;
}

export const checkProperty = (propertyName: string) =>
  function checkPropertyDecorator(
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = function checkMethod(...args: unknown[]): unknown {
      if (!(this as Record<string, unknown>)[propertyName]) {
        throw new Error(
          `Property ${propertyName} was not found or is falsy on the instance when calling ${propertyKey}`,
        );
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };

export class TrainingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Training Error';
  }
}

export function throwError(error: Error, { duration = 3000 } = {}): void {
  logger.error(`${error.name}: ${error.message}`, error);
  notification({
    title: error.name,
    message: error.message,
    type: 'danger',
    duration,
  });
}
