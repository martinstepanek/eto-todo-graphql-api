import { weekNumber } from 'weeknumber';

export class DateHelper {
    public static daysInMonth(date: Date): number {
        return new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    }

    public static weekNumber(date: Date): number {
        return weekNumber(date);
    }
}
