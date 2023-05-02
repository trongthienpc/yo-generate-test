import Router from 'express-promise-router';
import { Container } from 'typedi';
import { validation } from '../middlewares';
import { AuthService } from '../services';
import { LoginDTO } from '../types';

const router = Router();

/**
 * POST /auth/login
 *
 * Authenticate user
 */
router.post<{}, { token: string }, LoginDTO>(
  '/login',
  validation.celebrate({
    body: {
      email: validation.schemas.email.required(),
      password: validation.schemas.password.required(),
    },
  }),
  async (req, res) => {
    const { email, password } = req.body;

    const token = await Container.get(AuthService).login(email, password);

    res.status(200).json({ token });
  },
);

export default router;
