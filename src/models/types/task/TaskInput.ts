import { Field, InputType } from 'type-graphql';
import { DateType } from './DateType';
import { RecurrentType } from './RecurrentType';

@InputType()
export class TaskInput {
    @Field({ description: "Task's name" })
    public name: string;

    @Field({ description: "Task's detail", nullable: true })
    public detail: string;

    @Field({ description: '0 - Date, 1 - Week, 2 - Month' })
    public specificDateType: DateType;

    @Field({ description: 'timestamp|weekNumber|monthNumber' })
    public specificDateValue: number;

    @Field({ description: 'Timestamp with hours and minutes after midnight', nullable: true })
    public specificTimeValue: number;

    @Field({ description: '0 - Daily, 1 - Weekly, 2 - Monthly', nullable: true })
    public recurrentType: RecurrentType;

    @Field({ description: 'weekDay|monthDay', nullable: true })
    public recurrentTime: number;
}
