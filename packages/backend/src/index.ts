import { app } from './app';
import { logger } from './logger';

export default function runBackend(): void {
  const port = app.get('port');
  const host = app.get('host');

  process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection %O', reason));

  app.listen(port).then(() => {
    logger.info(`Marcelle Backend application started on http://${host}:${port}`);
  });
}
