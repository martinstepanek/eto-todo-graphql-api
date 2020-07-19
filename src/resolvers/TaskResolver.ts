import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Task } from '../models/task/Task';
import { TaskRepository } from '../repositories/TaskRepository';
import { TaskInput } from '../models/task/TaskInput';
import { Context } from '../models/Context';
import { TaskListType } from '../models/task/TaskListType';
import { Inject } from 'typedi';
import { TaskService } from '../services/TaskService';

@Resolver(Task)
export class TaskResolver {
    public constructor(
        @InjectRepository() private readonly taskRepository: TaskRepository,
        @Inject('TaskService') private readonly taskService: TaskService
    ) {}

    @Authorized()
    @Mutation(() => Task, { description: 'Create new task' })
    public async createTask(@Arg('task') taskInput: TaskInput, @Ctx() ctx: Context): Promise<Task> {
        const task = this.taskRepository.create(taskInput);
        task.user = ctx.user;
        await this.taskRepository.save(task);
        return await this.taskRepository.findOne(task.taskId);
    }

    @Authorized()
    @Query(() => [Task], { description: 'Get tasks by list type' })
    public async getTasks(@Arg('listType') listType: TaskListType, @Ctx() ctx: Context): Promise<Task[]> {
        return this.taskService.getTasksByListType(listType, ctx.user);
    }
}
