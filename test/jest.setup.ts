import express from 'express';
import { createServer, Server } from 'http';
import request, { SuperAgentTest } from 'supertest';
import { Container } from 'typedi';
import initializeApp from '../src/app';
import { config, logger } from '../src/config';
import * as loaders from '../src/loaders';
import { mailerMock, redisMock } from './mocks';

let server: Server;

export let agent: SuperAgentTest;

beforeAll(async () => {
  // Inject config and logger
  Container.set('config', config);
  Container.set('logger', logger);

  // Create express application
  const app = express();
  Container.set('app', app);

  // Create HTTP server
  server = createServer(app);
  Container.set('server', server);

  // Initialize Sequelize instance
  const sequelize = await loaders.initSequelize();
  Container.set('sequelize', sequelize);

  // Initialize i18n
  const i18n = await loaders.initI18n();
  Container.set('i18n', i18n);

  // Initialize Socket.IO server
  const socket = loaders.initSocketIo();
  Container.set('socket', socket);

  // Inject mocked services
  Container.set('mailer', mailerMock);
  Container.set('redis', redisMock);

  // Initialize application
  initializeApp(app);

  // Start server
  await new Promise<void>(resolve => {
    server.listen(config.port, () => {
      agent = request.agent(app);

      resolve();
    });
  });
});

afterAll(async () => {
  // Close server connection
  await new Promise<void>((resolve, reject) => {
    server.close(err => {
      if (err) reject(err);
      else resolve();
    });
  });
});
