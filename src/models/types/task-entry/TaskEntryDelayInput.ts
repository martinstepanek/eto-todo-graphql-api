import { Field, InputType, Int } from 'type-graphql';
import { DateType } from '../task/DateType';
import { TaskEntryInput } from './TaskEntryInput';

@InputType()
export class TaskEntryDelayInput extends TaskEntryInput {
    @Field(() => DateType)
    public specificDateType: DateType;

    @Field(() => Date, { description: 'Current datetime' })
    public specificDateValue: Date;

    @Field(() => Int, { description: 'Datetime with hours and minutes after midnight', nullable: true })
    public specificTimeValue: number;
}
