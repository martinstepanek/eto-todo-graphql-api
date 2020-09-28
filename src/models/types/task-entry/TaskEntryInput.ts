import { Field, InputType } from 'type-graphql';

@InputType()
export class TaskEntryInput {
    @Field({ description: "Task's id" })
    public taskId: string;

    @Field(() => Date, { description: 'When was task done' })
    public whenDone: Date;
}
