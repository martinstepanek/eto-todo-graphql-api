import { Context } from '../models/Context';
import { ExpressContext } from 'apollo-server-express/src/ApolloServer';
import * as TypeORM from 'typeorm';
import { UserRepository } from '../repositories/UserRepository';
import { UnauthorizedError } from 'type-graphql';
import { UserIdentity } from '../models/types/user/UserIdentity';

export const contextFactory = async ({ req }: ExpressContext): Promise<Context> => {
    const accessToken = req.header('Access-Token');

    const userIdentity = new UserIdentity();
    const context: Context = {
        userIdentity,
        req,
    };

    if (accessToken) {
        const userRepository = TypeORM.getCustomRepository(UserRepository);
        const user = await userRepository.findOne({
            where: {
                accessToken,
            },
        });
        context.userIdentity.user = user;
        if (!user) {
            throw new UnauthorizedError();
        }
    }

    return context;
};
