import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Task } from '../models/types/task/Task';
import { TaskRepository } from '../repositories/TaskRepository';
import { TaskInput } from '../models/types/task/TaskInput';
import { Context } from '../models/Context';
import { TaskListType } from '../models/types/task/TaskListType';
import { Inject } from 'typedi';
import { TaskService } from '../models/services/TaskService';
import { TaskEntryDoneInput } from '../models/types/task-entry-done/TaskEntryDoneInput';
import { TaskEntryDoneRepository } from '../repositories/TaskEntryDoneRepository';
import { TaskEntryDone } from '../models/types/task-entry-done/TaskEntryDone';

@Resolver(Task)
export class TaskResolver {
    public constructor(
        @InjectRepository() private readonly taskRepository: TaskRepository,
        @InjectRepository() private readonly taskEntryDoneRepository: TaskEntryDoneRepository,
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
        return this.taskService.getMarkedTasksByListType(listType, ctx.user);
    }

    @Authorized()
    @Mutation(() => Task, { description: 'Mark task as done' })
    public async markTaskAsDone(
        @Arg('taskEntryDone') taskEntryDoneInput: TaskEntryDoneInput,
        @Ctx() ctx: Context
    ): Promise<Task> {
        const task = await this.taskRepository.findOne(taskEntryDoneInput.taskId);

        const taskEntryDone = new TaskEntryDone();
        taskEntryDone.task = task;
        taskEntryDone.whenDone = new Date(taskEntryDoneInput.whenDone * 1000);
        await this.taskEntryDoneRepository.save(taskEntryDone);

        task.isDone = true;
        return task;
    }

    @Authorized()
    @Mutation(() => Task, { description: 'Mark task as not done' })
    public async markTaskAsNotDone(@Arg('taskId') taskId: string, @Ctx() ctx: Context): Promise<void> {
        await this.taskRepository.findOne(taskId);
    }
}
