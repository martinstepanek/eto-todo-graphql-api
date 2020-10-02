import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { TaskListType } from '../types/task/TaskListType';
import { Task } from '../types/task/Task';
import { TaskEntryRepository } from '../../repositories/TaskEntryRepository';
import { Between } from 'typeorm';
import { DateHelper } from '../helpers/DateHelper';
import { TaskEntryType } from '../types/task-entry/TaskEntryType';
import { TaskEntry } from '../types/task-entry/TaskEntry';

@Service('TaskEntryService')
export class TaskEntryService {
    constructor(@InjectRepository() private readonly taskEntryRepository: TaskEntryRepository) {}

    public async markFor(tasks: Task[], taskListType: TaskListType): Promise<Task[]> {
        const date = DateHelper.getDateForListType(taskListType);

        for (const task of tasks) {
            const entry = await this.findEntry(task, date);

            task.isDone = !!entry && entry.type === TaskEntryType.Done;
            task.isDelayed = !!entry && entry.type === TaskEntryType.Delayed;
            task.isDeleted = !!entry && entry.type === TaskEntryType.Deleted;
        }

        return tasks;
    }

    public async findEntry(task: Task, date: Date): Promise<TaskEntry> {
        const start = DateHelper.getStartOfPeriod(date, task.specificDateType);
        let end = DateHelper.getEndOfPeriod(date, task.specificDateType);

        return await this.taskEntryRepository.findOne({
            where: {
                task,
                whenDone: Between(start, end),
            },
        });
    }
}
