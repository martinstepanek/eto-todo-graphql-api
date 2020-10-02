import { Field, InputType } from 'type-graphql';
import { TaskEntryInput } from './TaskEntryInput';

@InputType()
export class TaskEntryDeleteInput extends TaskEntryInput {
    @Field(() => Boolean, { description: 'Delete all recurring of this task or just one occurrence' })
    public allRecurringTasks: boolean;
}
