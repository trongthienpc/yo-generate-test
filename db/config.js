const dotenv = require('dotenv');

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const debug = process.env.DEBUG === 'true';

const options = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dialect: 'postgres',
  dialectOptions: {
    charset: 'utf8_general_ci',
  },
  logging: debug ? console.log : false,

  // Migration storage
  migrationStorage: 'sequelize',
  migrationStorageTableName: 'sequelize_migrations',

  // Seed storage
  seederStorage: 'sequelize',
  seederStorageTableName: 'sequelize_seeders',
};

module.exports = {
  development: options,
  production: options,
  test: options,
};
