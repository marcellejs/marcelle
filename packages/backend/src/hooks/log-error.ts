// For more information about this file see https://dove.feathersjs.com/guides/cli/log-error.html
import type { HookContext, NextFunction } from '../declarations';
import { logger } from '../logger';

export const logError = async (context: HookContext, next: NextFunction) => {
  try {
    let msg = `${context.params.provider || 'internal'}:${context.method} called on '${context.path}'`;
    if (context.id) {
      msg += ` (id: ${context.id})`;
    }
    if (context.params.query && Object.keys(context.params.query).length > 0) {
      msg += `, with query ${JSON.stringify(context.params.query)}`;
    }
    if (context.data) {
      msg += `, with data fields [${Object.keys(context.data).join(', ')}]`;
    }
    logger.debug(msg);
    await next();
  } catch (error: any) {
    logger.error(error.stack);

    // Log validation errors
    if (error.data) {
      logger.error('Data: %O', error.data);
    }

    throw error;
  }
};
