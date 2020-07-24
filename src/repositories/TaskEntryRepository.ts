import { EntityRepository, Repository } from 'typeorm';
import { Service } from 'typedi';
import { TaskEntry } from '../models/types/task-entry/TaskEntry';

@Service()
@EntityRepository(TaskEntry)
export class TaskEntryRepository extends Repository<TaskEntry> {}
