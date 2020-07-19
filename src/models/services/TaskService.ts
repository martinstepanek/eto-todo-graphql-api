import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { TaskRepository } from '../../repositories/TaskRepository';
import { TaskListType } from '../types/task/TaskListType';
import { Task } from '../types/task/Task';
import { DateType } from '../types/task/DateType';
import { Between } from 'typeorm';
import { User } from '../types/user/User';
import { DateHelper } from '../helpers/DateHelper';

@Service('TaskService')
export class TaskService {
    constructor(@InjectRepository() private readonly taskRepository: TaskRepository) {}

    public async getTasksByListType(taskListType: TaskListType, forUser: User): Promise<Task[]> {
        switch (taskListType) {
            case TaskListType.Today:
                return this.getTasksForToday(forUser);
            case TaskListType.Tomorrow:
                return this.getTasksForTomorrow(forUser);
            case TaskListType.ThisWeek:
                return this.getTasksForThisWeek(forUser);
            case TaskListType.NextWeek:
                return this.getTasksForNextWeek(forUser);
            case TaskListType.ThisMonth:
                return this.getTasksForThisMonth(forUser);
            case TaskListType.NextMonth:
                return this.getTasksForNextMonth(forUser);
            default:
                throw new Error('We are sorry, but this list type is not implemented yet');
        }
    }

    private async getTasksForToday(forUser: User): Promise<Task[]> {
        return this.getTasksForDay(forUser, new Date());
    }

    private async getTasksForTomorrow(forUser: User): Promise<Task[]> {
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.getTasksForDay(forUser, tomorrow);
    }

    private async getTasksForDay(forUser: User, day: Date): Promise<Task[]> {
        let today = new Date(day.getTime());
        let todayStart = Math.floor(new Date(day.getTime()).setHours(0, 0, 0, 0) / 1000);
        let todayEnd = Math.floor(new Date(day.getTime()).setHours(23, 59, 59) / 1000);

        let tasks = await this.taskRepository.find({
            where: {
                user: forUser,
                specificDateType: DateType.Date.toString(),
                specificDateValue: Between(todayStart, todayEnd),
            },
        });

        if (today.getDay() === 0) {
            // Today is Sunday
            tasks = [...tasks, ...(await this.getTasksForThisWeek(forUser))];
        }

        if (today.getDate() === DateHelper.daysInMonth(today)) {
            // Today is last day of month
            tasks = [...tasks, ...(await this.getTasksForThisMonth(forUser))];
        }

        return tasks;
    }

    private async getTasksForThisWeek(forUser: User): Promise<Task[]> {
        return this.getTasksForWeek(forUser, new Date());
    }

    private async getTasksForNextWeek(forUser: User): Promise<Task[]> {
        let newtWeek = new Date();
        newtWeek.setDate(newtWeek.getDate() + 7);
        return this.getTasksForWeek(forUser, newtWeek);
    }

    private async getTasksForWeek(forUser: User, date: Date): Promise<Task[]> {
        return this.taskRepository.find({
            where: {
                user: forUser,
                specificDateType: DateType.Week.toString(),
                specificDateValue: DateHelper.weekNumber(date),
            },
        });
    }

    private async getTasksForThisMonth(forUser: User): Promise<Task[]> {
        return this.getTasksForMonth(forUser, new Date());
    }

    private async getTasksForNextMonth(forUser: User): Promise<Task[]> {
        let nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return this.getTasksForMonth(forUser, nextMonth);
    }

    private async getTasksForMonth(forUser: User, date: Date): Promise<Task[]> {
        return this.taskRepository.find({
            where: {
                user: forUser,
                specificDateType: DateType.Month.toString(),
                specificDateValue: date.getMonth() + 1,
            },
        });
    }
}
