import { Field, ObjectType } from 'type-graphql';
import { TaskListType } from './TaskListType';
import { TaskOperationType } from './TaskOperationType';
import { Task } from './Task';

@ObjectType()
export class TaskOperation {
    @Field(() => TaskOperationType)
    public operationType: TaskOperationType;

    @Field(() => Task)
    public task: Task;

    @Field(() => [TaskListType])
    public inLists: TaskListType[];
}
