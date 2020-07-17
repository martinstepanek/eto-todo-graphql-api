import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { User } from '../models/user/User';
import { UserInput } from '../models/user/UserInput';
import { UserRepository } from '../repositories/UserRepository';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Resolver(User)
export class UserResolver {
    public constructor(@InjectRepository() private readonly userRepository: UserRepository) {}

    @Query(() => User, { description: 'Get user by id' })
    public async user(@Arg('userId') userId: string): Promise<User> {
        const model = await this.userRepository.findOne(userId);
        if (model === undefined) {
            // throw not found error
        }
        return model;
    }


    @Mutation(() => User, { description: 'Login/Register new user' })
    public async login(
        @Arg('user') userInput: UserInput,
    ): Promise<User> {


        let user = this.userRepository.create();
        await this.userRepository.save(user);
        return this.userRepository.findOne(user.userId);
    }
}
