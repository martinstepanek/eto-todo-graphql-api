import { TaskListType } from '../types/task/TaskListType';
import { DateType } from '../types/task/DateType';

export class DateHelper {
    public static daysInMonth(date: Date): number {
        return new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    }

    public static getMonday(date: Date): Date {
        date = new Date(date);
        let day = date.getDay(),
            diff = date.getDate() - day + (day == 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    }

    public static getSunday(date: Date): Date {
        date = new Date(date);
        let day = date.getDay(),
            diff = date.getDate() - day + (day == 0 ? 0 : 7);
        return new Date(date.setDate(diff));
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

    public static getDateTypeForListType(taskListType: TaskListType): DateType {
        if ([TaskListType.Today, TaskListType.Tomorrow].includes(taskListType)) {
            return DateType.Date;
        }
        if ([TaskListType.ThisWeek, TaskListType.NextWeek].includes(taskListType)) {
            return DateType.Week;
        }
        if ([TaskListType.ThisMonth, TaskListType.NextMonth].includes(taskListType)) {
            return DateType.Month;
        }
        throw new Error('We are sorry, but this list type is not implemented yet');
    }

    public static getStartOfPeriod(date: Date, dateType: DateType): Date {
        if (dateType === DateType.Date) {
            return new Date(new Date(date).setHours(0, 0, 0, 0));
        }
        if (dateType === DateType.Week) {
            const startDate = new Date(DateHelper.getMonday(date));
            startDate.setHours(0, 0, 0, 0);
            return startDate;
        }
        if (dateType === DateType.Month) {
            const startDate = new Date(date);
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
            return startDate;
        }
    }

    public static getEndOfPeriod(date: Date, dateType: DateType): Date {
        if (dateType === DateType.Date) {
            return new Date(new Date(date).setHours(23, 59, 59));
        }
        if (dateType === DateType.Week) {
            const endDate = new Date(DateHelper.getSunday(date));
            endDate.setHours(23, 59, 59);
            return endDate;
        }
        if (dateType === DateType.Month) {
            const endDate = new Date(date);
            endDate.setDate(DateHelper.daysInMonth(endDate));
            endDate.setHours(23, 59, 59);
            return endDate;
        }
    }
}
