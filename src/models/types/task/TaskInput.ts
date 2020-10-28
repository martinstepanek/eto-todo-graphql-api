import { Field, InputType, Int } from 'type-graphql';
import { DateType } from './DateType';
import { Length } from 'class-validator';

@InputType()
export class TaskInput {
    @Field({ description: "Task's name" })
    public name: string;

    @Field({ description: "Task's detail", nullable: true })
    @Length(0, 500)
    public detail: string;

    @Field(() => DateType)
    public specificDateType: DateType;

    @Field(() => Date, { nullable: true, description: 'Current datetime' })
    public specificDateValue: Date;

    @Field(() => Int, { description: 'Datetime with hours and minutes after midnight', nullable: true })
    public specificTimeValue: number;

    @Field({ description: 'Is task recurrent?' })
    public isRecurrent: boolean = false;

    @Field(() => Int, {
        nullable: true,
        description: 'When specificDateType=Week: day in week (1-7), When specificDateType=Month: Day in month (1-31)',
    })
    public recurrentDateValue: number;
}
