import { Field, InputType, Int } from 'type-graphql';
import { DateType } from './DateType';

@InputType()
export class TaskInput {
    @Field({ description: "Task's name" })
    public name: string;

    @Field({ description: "Task's detail", nullable: true })
    public detail: string;

    @Field(() => DateType)
    public specificDateType: DateType;

    @Field(() => Date, { description: 'Current datetime' })
    public specificDateValue: Date;

    @Field(() => Int, { description: 'Datetime with hours and minutes after midnight', nullable: true })
    public specificTimeValue: number;

    @Field({ description: 'Is task recurrent?'})
    public isRecurrent: boolean = false;
}
