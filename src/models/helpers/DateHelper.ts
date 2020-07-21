import { weekNumber } from 'weeknumber';
import { TaskListType } from '../types/task/TaskListType';

export class DateHelper {
    public static daysInMonth(date: Date): number {
        return new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    }

    public static weekNumber(date: Date): number {
        return weekNumber(date);
    }

    public static getMonday(date: Date): Date {
        date = new Date(date);
        let day = date.getDay(),
            diff = date.getDate() - day + (day == 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    }

    public static getSunday(date: Date): Date {
        date = new Date(date);
        return new Date(date.setDate(this.getMonday(date).getDate() + 6));
    }

    public static getDateForListType(taskListType: TaskListType): Date {
        switch (taskListType) {
            case TaskListType.Today:
                return new Date();
            case TaskListType.Tomorrow:
                let tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return tomorrow;
            case TaskListType.ThisWeek:
                return new Date();
            case TaskListType.NextWeek:
                let nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                return nextWeek;
            case TaskListType.ThisMonth:
                return new Date();
            case TaskListType.NextMonth:
                let nextMonth = new Date();
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                return nextMonth;
            default:
                throw new Error('We are sorry, but this list type is not implemented yet');
        }
    }
}
