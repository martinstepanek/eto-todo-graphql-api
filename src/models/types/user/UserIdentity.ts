import { User } from './User';

export class UserIdentity {
    public user: User;

    public get isLoggedIn(): boolean {
        return Boolean(this.user);
    }

    public isItMe(userEntity: User): boolean {
        return this.isLoggedIn && userEntity && this.user.userId === userEntity.userId;
    }
}
