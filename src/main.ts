import { buildSchema } from 'type-graphql';
import { UserResolver } from './resolvers';
import { Container } from 'typedi';
import * as TypeORM from 'typeorm';
import { TaskResolver } from './resolvers/TaskResolver';
import { contextFactory } from './bootstrap/contextFactory';
import { errorFormatter } from './bootstrap/errorFormatter';
import express from 'express';
import { authChecker } from './bootstrap/authChecker';
import * as Sentry from '@sentry/node';
import { registerEnumsToSchema } from './bootstrap/registerEnumsToSchema';
import createMetricsPlugin from 'apollo-metrics';
import { register as registerPrometheusClient } from 'prom-client';
import config from './config';
import { ApolloServer } from 'apollo-server-express';
import { apolloServerSentryPlugin } from './bootstrap/apolloServerSentryPlugin';

/**
 * Bootstrapping function
 */
async function bootstrap(): Promise<void> {
    TypeORM.useContainer(Container);

    await TypeORM.createConnection();

    registerEnumsToSchema();

    const schema = await buildSchema({
        resolvers: [UserResolver, TaskResolver],

        container: Container,
        authChecker: authChecker,
    });

    // Express app
    const app = express();

    app.use(Sentry.Handlers.requestHandler());

    // Setup /graphql/metrics endpoint for prometheus
    app.get('/graphql/metrics', (_, res) => res.send(registerPrometheusClient.metrics()));
    const apolloMetricsPlugin = createMetricsPlugin(registerPrometheusClient);

    const isEnvDev = config.environment === 'dev';

    // Apollo server
    const server = new ApolloServer({
        schema,
        context: contextFactory,
        formatError: errorFormatter,
        debug: isEnvDev,
        introspection: isEnvDev,
        playground: isEnvDev,

        // @ts-ignore
        plugins: [apolloMetricsPlugin, apolloServerSentryPlugin],
        tracing: true,
    });

    server.applyMiddleware({ app });

    app.listen({ port: 4000 }, () => {
        console.log(`Server ready at http://localhost:4000${server.graphqlPath}`);
    });
}

bootstrap();
