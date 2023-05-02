import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import express from 'express';
import { createServer } from 'http';
import { Container } from 'typedi';
import initializeApp from './app';
import { config, logger } from './config';
import runJobs from './jobs';
import * as loaders from './loaders';

(async () => {
  // Inject config and logger
  Container.set('config', config);
  Container.set('logger', logger);

  // Create Express application
  const app = express();
  Container.set('app', app);

  // Create HTTP server
  const server = createServer(app);
  Container.set('server', server);

  // Initialize Sequelize instance
  const sequelize = await loaders.initSequelize();
  Container.set('sequelize', sequelize);
  const { options } = sequelize;
  logger.info(
    `Successfully connected to database '${options.database}' at '${options.host}:${options.port}'`,
  );

  // Initialize mailer instance
  const mailer = await loaders.initMailer();
  Container.set('mailer', mailer);
  logger.info('Successfully connected to SMTP server');

  // Initialize Redis client
  const redis = await loaders.initRedis();
  Container.set('redis', redis);
  logger.info('Successfully connected to Redis server');

  // Initialize i18n
  const i18n = await loaders.initI18n();
  Container.set('i18n', i18n);
  logger.info('Successfully initialized i18n resources');

  // Initialize Socket.IO server
  const socket = loaders.initSocketIo();
  Container.set('socket', socket);
  logger.info('Successfully initialized Socket.IO server');

  // Initialize job scheduler
  runJobs();

  // Initialize application
  initializeApp(app);

  // Initialize Sentry
  Sentry.init({
    enabled: config.env === 'production',
    integrations: [
      // Enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // Enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
      // Enable MySQL requests tracing
      new Tracing.Integrations.Mysql(),
      // Enable uncaught exceptions tracing
      new Sentry.Integrations.OnUncaughtException(),
      // Enable unhandled rejections tracing
      new Sentry.Integrations.OnUnhandledRejection(),
    ],
  });

  // Start server
  await new Promise<void>(resolve => {
    server.listen(config.port, () => {
      logger.info(`App is running on port ${config.port} in ${config.env} mode`);

      resolve();
    });
  });
})().catch(err => {
  logger.error('Application initialization failed.', err);

  process.exit(1);
});
