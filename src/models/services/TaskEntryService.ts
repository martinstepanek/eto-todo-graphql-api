import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { TaskListType } from '../types/task/TaskListType';
import { Task } from '../types/task/Task';
import { TaskEntryRepository } from '../../repositories/TaskEntryRepository';
import { DateType } from '../types/task/DateType';
import { Between } from 'typeorm';
import { DateHelper } from '../helpers/DateHelper';
import { TaskEntryType } from '../types/task-entry/TaskEntryType';

@Service('TaskEntryService')
export class TaskEntryService {
    constructor(@InjectRepository() private readonly taskEntryDoneRepository: TaskEntryRepository) {}

    public async markDoneFor(tasks: Task[], taskListType: TaskListType): Promise<Task[]> {
        const date = DateHelper.getDateForListType(taskListType);

        for (const task of tasks) {
            // TODO: refactor it
            let start = 0;
            let end = 0;
            if (task.specificDateType === DateType.Date) {
                start = new Date(date).setHours(0, 0, 0, 0);
                end = new Date(date).setHours(23, 59, 59);
            }
            if (task.specificDateType === DateType.Week) {
                const startDate = new Date(DateHelper.getMonday(date));
                startDate.setHours(0, 0, 0, 0);

                const endTime = new Date(DateHelper.getSunday(date));
                endTime.setHours(23, 59, 59);

                start = startDate.getTime();
                end = endTime.getTime();
            }
            if (task.specificDateType === DateType.Month) {
                const startDate = new Date(date);
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);

                const endDate = new Date(date);
                endDate.setDate(DateHelper.daysInMonth(endDate));
                endDate.setHours(23, 59, 59);

                start = startDate.getTime();
                end = endDate.getTime();
            }

            const entry = await this.taskEntryDoneRepository.findOne({
                where: {
                    task,
                    whenDone: Between(new Date(start), new Date(end)),
                },
            });
            task.isDone = !!entry && entry.type === TaskEntryType.Done;
            task.isDelayed = !!entry && entry.type === TaskEntryType.Delayed;
        }

        return tasks;
    }
}
