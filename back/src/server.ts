import logger from './services/logger';
import * as dotenv from 'dotenv';

import p from 'path';

dotenv.config({ path: p.join(__dirname, '../../config/.env') });

import app from './app';
logger.info(
  'PG',
  process.env.PG_HOST,
  process.env.PG_PORT!,
  process.env.PG_DB!,
);
app.connectServices(
  process.env.PG_HOST!,
  parseInt(process.env.PG_PORT!, 10),
  process.env.PG_DB!,
  process.env.PG_USER!,
  process.env.PG_PASSWORD!,
  process.env.REDIS_HOST!,
  parseInt(process.env.REDIS_PORT!, 10),
);

const PORT = parseInt(String(process.env.BACK_PORT), 10);
/**
 * Emitted when an error isn't explicitly caught
 */
process.on('uncaughtException', (error: Error) => {
  logger.error('UncaughtException ' + error);
});

/**
 * Emitted when a Promise terminates unexpectly and no `catch` clause
 * has been applied
 */
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('unhandledRejection ' + reason);
});

const closeServer = async () => {
  logger.info('Starting graceful shutdown');
  const exitCode = await app.disconnectServices();
  process.exit(exitCode);
};

process.on('SIGINT', closeServer);
process.on('SIGTERM', closeServer);

app.server.listen(PORT, () => {
  logger.info(`Server started at http://localhost:${PORT}`);
});
