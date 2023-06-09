import AdminJSSequelize from '@adminjs/sequelize';
import AdminJS, { CurrentAdmin } from 'adminjs';
import { Sequelize } from 'sequelize';
import { Container } from 'typedi';
import { Config } from '../config';
import { adminDTO } from '../dto';
import { UserModel } from '../models';
import { UserRoleEnum } from '../types/enums';
import { componentLoader } from './components';
import * as translations from './locale';
import * as resources from './resources';

// Register Sequelize adapter
AdminJS.registerAdapter(AdminJSSequelize);

export const menu = {
  users: {
    name: 'Users',
    icon: 'UserMultiple',
  },
};

export async function authenticateAdmin(
  email: string,
  password: string,
): Promise<CurrentAdmin | null> {
  const user = await UserModel.findOne({
    attributes: {
      include: ['email', 'fullName', 'password', 'role'],
    },
    where: {
      email,
      role: UserRoleEnum.Admin,
    },
  });

  if (!user) return null;

  const passwordMatch = await user.comparePassword(password);

  if (!passwordMatch) return null;

  return adminDTO(user);
}

export default function setupAdminJs(sequelize: Sequelize) {
  const config = Container.get<Config>('config');

  const adminJs = new AdminJS({
    assets: {
      styles: ['/public/styles/admin.css'],
    },
    branding: {
      companyName: 'yo-express-generator | Admin',
      favicon: '/public/favicon.ico',
    },
    componentLoader,
    locale: translations.en,
    resources: Object.values(resources).map(resource => resource(sequelize)),
    rootPath: '/admin',
    settings: {
      defaultPerPage: 20,
    },
    version: {
      admin: true,
      app: config.version,
    },
  });

  return adminJs;
}
