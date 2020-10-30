import { logger } from '../core/logger';
import notify from '../ui/util/notify';

export function Catch(
  target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor,
): PropertyDescriptor {
  const originalMethod = descriptor.value;

  // eslint-disable-next-line no-param-reassign
  descriptor.value = function safeMethod(...args: unknown[]): unknown {
    try {
      return originalMethod.apply(this, args);
    } catch (error) {
      logger.error(error);
      notify({
        title: error.name,
        message: error.message,
        type: 'danger',
      });
      return error;
    }
  };

  return descriptor;
}

export class TrainingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Training Error';
  }
}

export function throwError(error: Error): void {
  logger.error(`${error.name}: ${error.message}`, error);
  notify({
    title: error.name,
    message: error.message,
    type: 'danger',
  });
}
