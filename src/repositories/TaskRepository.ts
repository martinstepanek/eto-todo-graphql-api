import { EntityRepository, Repository } from 'typeorm';
import { Service } from 'typedi';
import { Task } from '../models/task/Task';

@Service()
@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {}
