import { Arg, Authorized, Mutation, Query, Resolver } from 'type-graphql';
import { User } from '../models/user/User';
import { UserInput } from '../models/user/UserInput';
import { UserRepository } from '../repositories/UserRepository';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Inject } from 'typedi';
import { AuthService } from '../services/AuthService';

@Resolver(User)
export class UserResolver {
    public constructor(
        @InjectRepository() private readonly userRepository: UserRepository,
        @Inject('AuthService') private readonly authService: AuthService
    ) {}

    @Authorized()
    @Query(() => User, { description: 'Get user by id' })
    public async user(@Arg('userId') userId: string): Promise<User> {
        const model = await this.userRepository.findOne(userId);
        if (model === undefined) {
            // throw not found error
        }
        return model;
    }

    @Mutation(() => User, { description: 'Login/Register new user' })
    public async login(@Arg('user') userInput: UserInput): Promise<User> {
        let token = await this.authService.verifyTokenId(userInput.tokenId);

        let user = await this.userRepository.findOne({
            where: {
                email: token.email,
            },
        });

        if (user) {
            return user;
        }

        let newUser = this.userRepository.create();
        newUser.name = token.name;
        newUser.email = token.email;
        newUser.picture = token.picture;
        newUser.accessToken = this.authService.generateAccessToken();
        await this.userRepository.save(newUser);

        return this.userRepository.findOne(newUser.userId);
    }
}
