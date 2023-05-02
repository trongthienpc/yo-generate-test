import Router from 'express-promise-router';
import { Container } from 'typedi';
import { auth, validation } from '../middlewares';
import { UserService } from '../services';
import { CreateUserDTO, User } from '../types';

const router = Router();

/**
 * GET /users/:userId
 *
 * Get user details
 */
router.get<{ userId: string }, User>(
  '/:userId',
  auth.required,
  validation.celebrate({
    params: {
      userId: validation.schemas.uuid.required(),
    },
  }),
  async (req, res) => {
    const { userId } = req.params;

    const user = await Container.get(UserService).getUserById(userId);

    res.status(200).json(user);
  },
);

/**
 * POST /users
 *
 * Create new user
 */
router.post<{}, User, CreateUserDTO>(
  '/',
  validation.celebrate({
    body: validation.Joi.object({
      firstName: validation.schemas.firstName.required(),
      lastName: validation.schemas.lastName.required(),
      email: validation.schemas.email.required(),
      password: validation.schemas.password.required(),
    }).required(),
  }),
  async (req, res) => {
    const userDetails = req.body;

    const user = await Container.get(UserService).createUser(userDetails);

    res.status(201).json(user);
  },
);

export default router;
