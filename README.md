# Eto Todo API

GraphQl API in TypeScript for Eto Todo app

## Setup

-   Create `src/config.ts` using `src/config.ts.env` and fill params

## Deploy

```
npm i & docker-compose up -d
```

## Commands

-   `npm run serve` - Run GraphQL API
-   `npm run migration` - Handy shortcut for migration cmd (see https://typeorm.io/#/migrations)
-   `npm run lint` - Run eslint fix on `./src`

## Configurations

-   `ormconfig.json` - Database
-   `nodemon.json` - For nodemon plugin for development
-   `docker-compose.yml` - Docker services
-   `tsconfig.json` - TypeScript compilation
-   `.eslintrc` - For eslint

## Directories in `./src`

-   `mirgrations` - Contains all (non-)generated migrations
-   `models` - Contains GraphQL/Entity models, Input models and Args models
-   `resolvers` - Contains all resolvers
-   `services` - Contains all services

## Script types

-   `<Type>Resolver` - Resolver (GraphQL resolver can be compared with REST API controller)
-   `<Type>Service` - Service that provides data of `<Type>`
-   `<Type>Input` - Input data model, model that comes into resolver
-   `<Type>Args` - Argument model, defines arguments in queries for `<Type>`
-   `<Type>` - GraphQL model (model that goes out from API) and Entity database model at once

## Important Libraries

-   [GrapQL Joga](https://github.com/prisma/graphql-yoga) - Provide GraphQL server (express + apollo), GraphQL tools, GraphQL subscriptions and GraphQL playground
-   [TypeGraphQL](https://typegraphql.ml/) - Layer for generation GraphQL schema from TypeScript
-   [Type ORM](https://typeorm.io) - Database layer (supports MySQL, MariaDB, PostgreSQL, CockroachDB, SQLite, MSSQL, Oracle and MongoDB)
-   [Class Validator](https://github.com/typestack/class-validator) - Provides decorators for validating class properties
-   [TS Node](https://github.com/TypeStrong/ts-node) - TypeScript executor for Node
-   [EsLint](https://eslint.org/) - Checking/Fixing code quality/standard tool

## Testing

Mocha or https://github.com/alsatian-test/alsatian
