import { GraphQLServer } from 'graphql-yoga';
import { AuthChecker, buildSchema, UnauthorizedError } from 'type-graphql';
import { UserResolver } from './resolvers';
import { Container } from 'typedi';
import * as TypeORM from 'typeorm';
import { UserRepository } from './repositories/UserRepository';
import { Context } from './models/Context';

/**
 * Bootstrapping function
 */
async function bootstrap(): Promise<void> {
    TypeORM.useContainer(Container);

    await TypeORM.createConnection();

    const customAuthChecker: AuthChecker<Context> = ({ root, args, context, info }, roles) => {
        return context.user !== null;
    };

    const schema = await buildSchema({
        resolvers: [UserResolver],

        container: Container,
        authChecker: customAuthChecker,
    });

    const server = new GraphQLServer({
        schema,
        context: async ({ request }): Promise<Context> => {
            const accessToken = request.header('Access-Token');
            if (!accessToken) {
                return { user: null };
            }

            const userRepository = TypeORM.getCustomRepository(UserRepository);
            const user = await userRepository.findOne({
                where: {
                    accessToken,
                },
            });

            if (accessToken && !user) {
                throw new UnauthorizedError();
            }

            return { user };
        },
    });
    server.start(() => console.log(`Server is running on http://localhost:4000`));
}

bootstrap();
