import { User } from '../models/types/user/User';
import { EntityRepository, Repository } from 'typeorm';
import { Service } from 'typedi';

@Service()
@EntityRepository(User)
export class UserRepository extends Repository<User> {}
