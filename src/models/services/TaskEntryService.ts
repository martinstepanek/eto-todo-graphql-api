import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { TaskListType } from '../types/task/TaskListType';
import { Task } from '../types/task/Task';
import { TaskEntryRepository } from '../../repositories/TaskEntryRepository';
import { Between } from 'typeorm';
import { DateHelper } from '../helpers/DateHelper';
import { TaskEntryType } from '../types/task-entry/TaskEntryType';

@Service('TaskEntryService')
export class TaskEntryService {
    constructor(@InjectRepository() private readonly taskEntryDoneRepository: TaskEntryRepository) {}

    public async markFor(tasks: Task[], taskListType: TaskListType): Promise<Task[]> {
        const date = DateHelper.getDateForListType(taskListType);

        for (const task of tasks) {
            // TODO: refactor it
            const start = DateHelper.getStartOfPeriod(date, task.specificDateType);
            let end = DateHelper.getEndOfPeriod(date, task.specificDateType);

            const entry = await this.taskEntryDoneRepository.findOne({
                where: {
                    task,
                    whenDone: Between(start, end),
                },
            });
            task.isDone = !!entry && entry.type === TaskEntryType.Done;
            task.isDelayed = !!entry && entry.type === TaskEntryType.Delayed;
        }

        return tasks;
    }
}
