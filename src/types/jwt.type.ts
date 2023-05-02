import { UserRoleEnum } from './enums';

/**
 * Decoded JWT token
 */
export type DecodedJWT = StandardJWTClaims & JWTPayload;

/**
 * Standard JWT claims
 */
export type StandardJWTClaims = {
  iat: number;
  iss: string;
  sub: string;
  jti: string;
};

/**
 * Custom JWT claims
 */
export type JWTPayload = {
  name: string;
  email: string;
  role: UserRoleEnum;
};

export type AuthUser = {
  id: string;
  email: string;
  role: UserRoleEnum;
};
