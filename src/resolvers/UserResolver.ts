import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { User } from '../models/types/user/User';
import { UserInput } from '../models/types/user/UserInput';
import { UserRepository } from '../repositories/UserRepository';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Inject } from 'typedi';
import { AuthService } from '../models/services/AuthService';
import { Context } from '../models/Context';

@Resolver(User)
export class UserResolver {
    public constructor(
        @InjectRepository() private readonly userRepository: UserRepository,
        @Inject('AuthService') private readonly authService: AuthService
    ) {}

    @Authorized()
    @Query(() => User, { description: 'Get user by id' })
    public async me(@Ctx() ctx: Context): Promise<User> {
        return ctx.userIdentity.user;
    }

    @Authorized()
    @Query(() => User, { nullable: true, description: 'Get user by id' })
    public async user(@Arg('userId') userId: string): Promise<User> {
        const model = await this.userRepository.findOne(userId);
        if (model === undefined) {
            return null;
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
