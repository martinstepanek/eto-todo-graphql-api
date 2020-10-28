import { Service } from 'typedi';
import { Task } from '../types/task/Task';
import { TaskListType } from '../types/task/TaskListType';
import { DateHelper } from '../helpers/DateHelper';
import { DateType } from '../types/task/DateType';

@Service('TaskListService')
export class TaskListService {
    public getInListsByTask(task: Task): TaskListType[] {
        const listTypes = [
            TaskListType.Today,
            TaskListType.Tomorrow,
            TaskListType.ThisWeek,
            TaskListType.NextWeek,
            TaskListType.ThisMonth,
            TaskListType.NextMonth,
        ];

        return listTypes.filter(listType =>
            this.doesTaskBelongToPeriod(
                task,
                DateHelper.getDateForListType(listType),
                DateHelper.getDateTypeForListType(listType)
            )
        );
    }

    public getInListsByDate(date: Date): TaskListType[] {
        const listTypes = [
            TaskListType.Today,
            TaskListType.Tomorrow,
            TaskListType.ThisWeek,
            TaskListType.NextWeek,
            TaskListType.ThisMonth,
            TaskListType.NextMonth,
        ];

        return listTypes.filter(listType => {
            const listTypeDate = DateHelper.getDateForListType(listType);
            const listTypeDateType = DateHelper.getDateTypeForListType(listType);
            const start = DateHelper.getStartOfPeriod(listTypeDate, listTypeDateType);
            const end = DateHelper.getEndOfPeriod(listTypeDate, listTypeDateType);

            return date >= start && date <= end;
        });
    }

    private doesTaskBelongToPeriod(task: Task, date: Date, dateType: DateType): boolean {
        if (task.isRecurrent) {
            const dayEnd = new Date(new Date(date).setHours(23, 59, 59));
            return (
                dateType === DateType.Date &&
                task.createdAt < dayEnd &&
                (task.specificDateType === DateType.Date ||
                    (task.specificDateType === DateType.Week && task.recurrentDateValue === date.getDay() + 1) ||
                    (task.specificDateType === DateType.Month && task.recurrentDateValue === date.getDate()))
            );
        } else {
            if (task.specificDateType !== dateType) {
                return false;
            }
            return (
                task.specificDateValue >= DateHelper.getStartOfPeriod(date, dateType) &&
                task.specificDateValue <= DateHelper.getEndOfPeriod(date, dateType)
            );
        }
    }
}
