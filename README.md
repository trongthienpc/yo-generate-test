# yo-express-generator <!-- omit in toc -->

> Just for test

- [Getting started](#getting-started)
  - [Configuration](#configuration)
  - [Installation](#installation)
- [Main commands](#main-commands)
- [About](#about)

## Getting started

### Configuration

Copy and rename `.env.example` to `.env`:

```sh
cp .env.example .env
```

Fill the `.env` file according to the following table.

| Variable             | Type      | Description                                       | Default | Note                                                                                                                     |
|----------------------|-----------|---------------------------------------------------|---------|--------------------------------------------------------------------------------------------------------------------------|
| `PORT`               | _Number_  | Port on which the server should listen            | `8080`  |                                                                                                                          |
| `NODE_ENV`           | _String_  | Application running environment                   |         | One of: `development`, `test`, `production`                                                                              |
| `DEBUG`              | _Boolean_ | Boolean indicating if debug mode is activated     | `false` | Primarily used by Sequelize to print SQL queries                                                                         |
| `PUBLIC_HOST`        | _String_  | Public URL of the web server                      |         |                                                                                                                          |
| `DB_HOST`            | _String_  | Database host                                     |         | Not required when using `docker-compose` as it gets overriden with the `db` container                                    |
| `DB_PORT`            | _Number_  | Database port                                     | `5432`  |                                                                                                           |
| `DB_NAME`            | _String_  | Database name                                     |         |                                                                                                                          |
| `DB_USER`            | _String_  | Database user                                     |         |                                                                                                                          |
| `DB_PASSWORD`        | _String_  | Database password                                 |         |                                                                                                                          |
| `REDIS_HOST`         | _String_  | Redis host                                        |         | Not required when using `docker-compose` as it gets overriden with the `redis` container                                 |
| `REDIS_PORT`         | _Number_  | Redis port                                        | `6379`  |                                                                                                                          |
| `JWT_SECRET`         | _String_  | Secret used to sign JWTs                          |         |                                                                                                                          |
| `SMTP_HOST`          | _String_  | SMTP host                                         |         |                                                                                                                          |
| `SMTP_PORT`          | _Number_  | SMTP port                                         | `465`   |                                                                                                                          |
| `SMTP_USER`          | _String_  | SMTP user                                         |         |                                                                                                                          |
| `SMTP_PASSWORD`      | _String_  | SMTP password                                     |         |                                                                                                                          |
| `SENTRY_DSN`         | _String_  | Sentry DSN                                        |         | See [Sentry Configuration](https://docs.sentry.io/platforms/node/configuration/options/)                                 |
| `SENTRY_ENVIRONMENT` | _String_  | Sentry environment                                |         | See [Sentry Configuration](https://docs.sentry.io/platforms/node/configuration/options/)                                 |
| `LETSENCRYPT_HOST`   | _String_  | Let's Encrypt host                                |         | See [letsencrypt-nginx-proxy-companion](https://github.com/nginx-proxy/docker-letsencrypt-nginx-proxy-companion)         |
| `LETSENCRYPT_EMAIL`  | _String_  | Let's Encrypt email                               |         | See [letsencrypt-nginx-proxy-companion](https://github.com/nginx-proxy/docker-letsencrypt-nginx-proxy-companion)         |

### Installation

#### With docker-compose <!-- omit in toc -->

Start a development server by running:

```sh
yarn docker:start:dev
```

#### Without docker-compose <!-- omit in toc -->

If **Node.js** is not installed on your machine, visit [this page](https://nodejs.org/en/download/) for download instructions.

Install required dependencies:

```sh
yarn
```

Start a development server by running:

```sh
yarn start:dev
```

## Main commands

| Command              | Arguments                               | Description                                                                                 |
|----------------------|-----------------------------------------|---------------------------------------------------------------------------------------------|
| `start`              |                                         | Start a server from compiled files                                                          |
| `start:dev`          |                                         | Start a development server with source files change detection                               |
| `build`              |                                         | Transpile TypeScript files into JavaScript in a `/dist` folder                              |
| `test`               |                                         | Run unit tests                                                                              |
| `test:e2e`           |                                         | Run e2e tests defined in the `/test` folder                                                 |
| `docker:start:*`     |                                         | Start docker-compose services in defined mode                                               |
| `db:create`          |                                         | Create database for the specified environment                                               |
| `db:drop`            |                                         | Drop database for the specified environment                                                 |
| `db:seed`            |                                         | Run seeders                                                                                 |
| `db:migrate`         |                                         | Run migrations                                                                              |
| `db:migrate:undo`    |                                         | Undo most recent migration                                                                  |
| `db:reset`           |                                         | Recreate database and run migrations and seeders                                            |
| `migrations:create`  | Migration name                          | Create a new migration file (ex: `yarn migrations:create add-user-table`)                   |
| `seeders:create`     | Seeder name                             | Create a new seeder file (ex: `yarn migrations:create base-users`)                          |
| `lint`               |                                         | Perform a lint check                                                                        |
| `lint:fix`           |                                         | Perform a lint check and try to automatically fix errors                                    |

## About

For more information about the project, see [About](./ABOUT.md).
