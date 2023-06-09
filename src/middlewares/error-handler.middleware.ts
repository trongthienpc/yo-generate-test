/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { JoiObject, ValidationError } from '@hapi/joi';
import { isCelebrate } from 'celebrate';
import { ErrorRequestHandler } from 'express';
import createHttpError, { HttpError, isHttpError } from 'http-errors';
import { i18n as I18n } from 'i18next';
import { BaseError } from 'sequelize';
import { Container } from 'typedi';
import { Logger } from 'winston';
import { Config } from '../config';

interface CelebrateError extends Error, JoiObject {
  joi: ValidationError;
}

/**
 * Returns `true` if the error originated from the `celebrate` middleware.
 */
function isCelebrateError(err: any): err is CelebrateError {
  return isCelebrate(err) || (<CelebrateError>err).joi != null || (<CelebrateError>err).isJoi;
}

/**
 * Middleware used to parse `celebrate` errors.
 */
export function celebrateErrorHandler(): ErrorRequestHandler {
  return (err, req, res, next) => {
    if (isCelebrateError(err)) {
      let { message } = err;

      if (err.joi) {
        const { details } = err.joi;

        message = details ? details[0].message : err.joi.message;
      }

      return next(createHttpError(400, err, { message }));
    }

    return next(err);
  };
}

/**
 * Returns `true` if the error originated from the `sequelize` package.
 */
function isSequelizeError(err: any): err is BaseError {
  return err instanceof BaseError;
}

/**
 * Middleware used to parse `sequelize` errors.
 */
export function sequelizeErrorHandler(): ErrorRequestHandler {
  return (err, req, res, next) => {
    if (isSequelizeError(err)) {
      const { message } = err;

      return next(createHttpError(500, err, { message }));
    }

    return next(err);
  };
}

/**
 * Parses an error to retrieve its HTTP `status`.
 */
const parseErrorStatus = (err: { status?: number | string }): number => {
  if (!err.status) {
    return 500;
  }

  return typeof err.status === 'number' ? err.status : parseInt(err.status, 10);
};

/**
 * Parses an error to retrieve its `message`.
 */
function parseErrorMessage(err: any): string {
  if (err instanceof Error) {
    return err.message;
  }

  if (typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message as string;
  }

  return `${err}`;
}

/**
 * Middleware used to handle HTTP error responses.
 *
 * This middleware should be declared after all other middlewares as it will end the response
 * process.
 */
export const errorHandler = (): ErrorRequestHandler => {
  const i18n = Container.get<I18n>('i18n');
  const config = Container.get<Config>('config');
  const logger = Container.get<Logger>('logger');

  return (err, req, res, next) => {
    let error: HttpError;

    // Format HTTP error
    if (isHttpError(err)) {
      error = err;
    } else {
      const status = parseErrorStatus(err);
      const message = parseErrorMessage(err);

      error = createHttpError(status, message);

      // Set error stack
      error.stack = err.stack ?? error.stack;
    }

    // Log error
    if (error.status < 500) {
      logger.warn(error);
    } else {
      logger.error(error);
    }

    // Determine if error message should be hidden from client
    if (config.env === 'production' && !error.expose) {
      error.message = i18n.t('errors:internalServerError');
    }

    // Set response status
    res.status(error.status);

    // Set response content according to acceptable format
    res.format({
      'text/plain': () => {
        res.send(`Error ${error.status} - ${error.name}: ${error.message}`);
      },

      'text/html': () => {
        res.send(`<p>Error ${error.status} - ${error.name}: ${error.message}</p>`);
      },

      'application/json': () => {
        res.json({
          status: error.status,
          name: error.name,
          message: error.message,
        });
      },

      'default': () => {
        res.status(406).send('Not Acceptable');
      },
    });
  };
};
