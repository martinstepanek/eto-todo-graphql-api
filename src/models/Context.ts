import { UserIdentity } from './types/user/UserIdentity';
import { Request } from 'express';

export class Context {
    public userIdentity: UserIdentity;
    public req: Request;
}
