import { EntityRepository, Repository } from 'typeorm';
import { Service } from 'typedi';
import { TaskEntryDone } from '../models/types/task-entry-done/TaskEntryDone';

@Service()
@EntityRepository(TaskEntryDone)
export class TaskEntryDoneRepository extends Repository<TaskEntryDone> {}
