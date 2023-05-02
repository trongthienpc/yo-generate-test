// Declare here type override declarations and global types

import { AuthUser } from './jwt.type';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
