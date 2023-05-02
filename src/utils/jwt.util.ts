import jwt from 'jsonwebtoken';
import { Container } from 'typedi';
import { v4 as uuidv4 } from 'uuid';
import { Config } from '../config';
import { JWTPayload } from '../types';

/**
 * Returns the secret used to sign a JWT token.
 */
export const getJwtSecret = (passwordHash: string): string => {
  const config = Container.get<Config>('config');

  return config.jwt.secret + passwordHash;
};

/**
 * Generates and returns a signed JWT.
 */
export const generateSignedJWT = (
  userId: string,
  passwordHash: string,
  payload: JWTPayload,
): string => {
  const config = Container.get<Config>('config');

  const secret = getJwtSecret(passwordHash);

  return jwt.sign(payload, secret, {
    algorithm: 'HS256',
    issuer: config.publicHost,
    subject: userId,
    jwtid: uuidv4(),
  });
};
