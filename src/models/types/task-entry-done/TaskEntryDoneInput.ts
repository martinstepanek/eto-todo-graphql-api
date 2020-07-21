import { Field, InputType } from 'type-graphql';

@InputType()
export class TaskEntryDoneInput {
    @Field({ description: "Task's id" })
    public taskId: string;

    @Field({ description: 'When was task done' })
    public whenDone: number;
}
