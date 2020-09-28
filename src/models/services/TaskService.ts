import { Inject, Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { TaskRepository } from '../../repositories/TaskRepository';
import { TaskListType } from '../types/task/TaskListType';
import { Task } from '../types/task/Task';
import { DateType } from '../types/task/DateType';
import { Between } from 'typeorm';
import { User } from '../types/user/User';
import { DateHelper } from '../helpers/DateHelper';
import { TaskEntryService } from './TaskEntryService';

@Service('TaskService')
export class TaskService {
    constructor(
        @InjectRepository() private readonly taskRepository: TaskRepository,
        @Inject('TaskEntryService') private readonly taskEntryService: TaskEntryService
    ) {}

    public async getMarkedTasksByListType(taskListType: TaskListType, forUser: User): Promise<Task[]> {
        return this.taskEntryService.markDoneFor(await this.getTasksByListType(taskListType, forUser), taskListType);
    }

    private async getTasksByListType(taskListType: TaskListType, forUser: User): Promise<Task[]> {
        switch (taskListType) {
            case TaskListType.Today:
                return this.getTasksForDay(forUser, DateHelper.getDateForListType(taskListType));
            case TaskListType.Tomorrow:
                return this.getTasksForDay(forUser, DateHelper.getDateForListType(taskListType));
            case TaskListType.ThisWeek:
                return this.getTasksForWeek(forUser, DateHelper.getDateForListType(taskListType));
            case TaskListType.NextWeek:
                return this.getTasksForWeek(forUser, DateHelper.getDateForListType(taskListType));
            case TaskListType.ThisMonth:
                return this.getTasksForMonth(forUser, DateHelper.getDateForListType(taskListType));
            case TaskListType.NextMonth:
                return this.getTasksForMonth(forUser, DateHelper.getDateForListType(taskListType));
            default:
                throw new Error('We are sorry, but this list type is not implemented yet');
        }
    }

    private async getTasksForDay(forUser: User, day: Date): Promise<Task[]> {
        let today = new Date(day);
        let todayStart = Math.floor(new Date(day).setHours(0, 0, 0, 0) / 1000);
        let todayEnd = Math.floor(new Date(day).setHours(23, 59, 59) / 1000);

        let tasks = await this.taskRepository.find({
            where: {
                user: forUser,
                specificDateType: DateType.Date.toString(),
                specificDateValue: Between(todayStart, todayEnd),
            },
        });

        if (today.getDay() === 0) {
            // Today is Sunday
            tasks = [...tasks, ...(await this.getTasksForWeek(forUser, new Date()))];
        }

        if (today.getDate() === DateHelper.daysInMonth(today)) {
            // Today is last day of month
            tasks = [...tasks, ...(await this.getTasksForMonth(forUser, new Date()))];
        }

        return tasks;
    }

    private async getTasksForWeek(forUser: User, date: Date): Promise<Task[]> {
        return this.taskRepository.find({
            where: {
                user: forUser,
                specificDateType: DateType.Week.toString(),
                specificDateValue: Between(
                    DateHelper.getStartOfPeriod(date, DateType.Week),
                    DateHelper.getEndOfPeriod(date, DateType.Week)
                ),
            },
        });
    }

    private async getTasksForMonth(forUser: User, date: Date): Promise<Task[]> {
        return this.taskRepository.find({
            where: {
                user: forUser,
                specificDateType: DateType.Month.toString(),
                specificDateValue: Between(
                    DateHelper.getStartOfPeriod(date, DateType.Month),
                    DateHelper.getEndOfPeriod(date, DateType.Month)
                )
            },
        });
    }
}
