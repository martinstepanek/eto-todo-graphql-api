import { EntityRepository, Repository } from 'typeorm';
import { Service } from 'typedi';
import { Task } from '../models/types/task/Task';

@Service()
@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {}
