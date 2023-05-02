import 'reflect-metadata';
import AdminJSExpress from '@adminjs/express';
import * as Sentry from '@sentry/node';
import bodyParser from 'body-parser';
import compression from 'compression';
import connectSequelize from 'connect-session-sequelize';
import cors from 'cors';
import express, { Application } from 'express';
import rateLimit from 'express-rate-limit';
import session, { SessionOptions } from 'express-session';
import statusMonitor from 'express-status-monitor';
import helmet from 'helmet';
import { NotFound, TooManyRequests } from 'http-errors';
import { i18n as I18n } from 'i18next';
import i18nHttpMiddleware from 'i18next-http-middleware';
import { join } from 'path';
import { Sequelize } from 'sequelize';
import favicon from 'serve-favicon';
import SocketIO from 'socket.io';
import { Container } from 'typedi';
import setupAdminJs, { authenticateAdmin } from './admin';
import { Config } from './config';
import router from './controllers';
import {
  celebrateErrorHandler,
  errorHandler,
  jwtErrorHandler,
  sequelizeErrorHandler,
} from './middlewares';
import { SessionModel } from './models';

/**
 * Method used to setup middlewares and routing for the `app` instance.
 */
export default function initializeApp(app: Application) {
  const config = Container.get<Config>('config');
  const i18n = Container.get<I18n>('i18n');
  const sequelize = Container.get<Sequelize>('sequelize');

  app.enable('trust proxy');
  app.use(bodyParser.json());
  app.use(compression());
  app.use(cors());
  app.use(favicon(join(config.publicPath, 'favicon.ico')));
  app.use(helmet());

  // Rate limiting configuration
  app.use(
    rateLimit({
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: i18n.t('errors:tooManyRequests'),
      statusCode: new TooManyRequests().statusCode,
      skip: () => !(config.env === 'production'),
    }),
  );

  // Status monitoring configuration
  app.use(
    statusMonitor({
      path: '/status',
      title: 'yo-express-generator | Monitoring',
      websocket: Container.get<SocketIO.Server>('socket'),
    }),
  );

  // Session store configuration
  const SequelizeStore = connectSequelize(session.Store);
  const store = new SequelizeStore({
    db: sequelize,
    checkExpirationInterval: 15 * 60 * 1000, // Remove expired session every 15 minutes
    expiration: 24 * 60 * 60 * 1000, // Set session expiry time to 24 hours
    tableName: SessionModel.options.tableName,
  });

  // AdminJS panel configuration
  const adminJs = setupAdminJs(sequelize);

  const sessionOptions: SessionOptions = {
    cookie: {
      httpOnly: true,
      secure: config.env === 'production',
    },
    name: 'adminjs',
    resave: true,
    saveUninitialized: true,
    secret: config.jwt.secret,
    store,
  };

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    adminJs,
    {
      authenticate: authenticateAdmin,
      cookieName: sessionOptions.name,
      cookiePassword: sessionOptions.secret as string,
    },
    null,
    sessionOptions,
  );

  app.use(adminJs.options.rootPath, adminRouter);

  // Sentry middleware configuration
  app.use(
    Sentry.Handlers.requestHandler({
      user: ['id', 'email'],
    }),
  );
  app.use(Sentry.Handlers.tracingHandler());

  // i18n middleware configuration
  app.use(i18nHttpMiddleware.handle(i18n));
  app.use((req, res, next) => {
    if (req.i18n) {
      Container.set('i18n', req.i18n);
    }

    next();
  });

  // API documentation
  app.use('/doc', express.static(join(config.publicPath, '/doc')));

  // Public assets
  app.use('/public', express.static(config.publicPath));

  // Sentry debug route
  app.get('/sentry-debug', () => {
    throw new Error('Sentry error');
  });

  // Routing configuration
  app.use(router);

  // 404 error handling
  app.use((req, res, next) => {
    const { baseUrl, url, method } = req;

    next(new NotFound(req.i18n.t('errors:routeNotFound', { method, baseUrl, url })));
  });

  // Error handling
  app.use(jwtErrorHandler());
  app.use(celebrateErrorHandler());
  app.use(sequelizeErrorHandler());
  app.use(Sentry.Handlers.errorHandler());
  app.use(errorHandler());
}
