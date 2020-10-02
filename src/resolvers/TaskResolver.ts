import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Task } from '../models/types/task/Task';
import { TaskRepository } from '../repositories/TaskRepository';
import { TaskInput } from '../models/types/task/TaskInput';
import { Context } from '../models/Context';
import { TaskListType } from '../models/types/task/TaskListType';
import { Inject } from 'typedi';
import { TaskService } from '../models/services/TaskService';
import { TaskEntryInput } from '../models/types/task-entry/TaskEntryInput';
import { TaskEntryRepository } from '../repositories/TaskEntryRepository';
import { TaskEntry } from '../models/types/task-entry/TaskEntry';
import { TaskEntryType } from '../models/types/task-entry/TaskEntryType';
import { DateHelper } from '../models/helpers/DateHelper';
import { Between } from 'typeorm';
import { TaskEntryDelayInput } from '../models/types/task-entry/TaskEntryDelayInput';
import { TaskEntryService } from '../models/services/TaskEntryService';

@Resolver(Task)
export class TaskResolver {
    public constructor(
        @InjectRepository() private readonly taskRepository: TaskRepository,
        @InjectRepository() private readonly taskEntryRepository: TaskEntryRepository,
        @Inject('TaskService') private readonly taskService: TaskService,
        @Inject('TaskEntryService') private readonly taskEntryService: TaskEntryService
    ) {}

    @Authorized()
    @Mutation(() => Task, { description: 'Create new task' })
    public async createTask(@Arg('task') taskInput: TaskInput, @Ctx() ctx: Context): Promise<Task> {
        const task = this.taskRepository.create(taskInput);
        task.user = ctx.userIdentity.user;
        await this.taskRepository.save(task);
        return await this.taskRepository.findOne(task.taskId);
    }

    @Authorized()
    @Query(() => [Task], { description: 'Get tasks by list type' })
    public async getTasks(
        @Arg('listType', () => TaskListType) listType: TaskListType,
        @Ctx() ctx: Context
    ): Promise<Task[]> {
        return this.taskService.getMarkedTasksByListType(listType, ctx.userIdentity.user);
    }

    @Authorized()
    @Mutation(() => Task, { nullable: true, description: 'Mark task as done' })
    public async markTaskAsDone(@Arg('taskEntry') taskEntryInput: TaskEntryInput): Promise<Task> {
        const task = await this.taskRepository.findOne(taskEntryInput.taskId);
        if (!task) {
            return null;
        }

        const entry = await this.taskEntryService.findEntry(task, taskEntryInput.when);
        if (entry) {
            return task;
        }

        const taskEntry = new TaskEntry();
        taskEntry.task = task;
        taskEntry.whenDone = taskEntryInput.when;
        taskEntry.type = TaskEntryType.Done;
        await this.taskEntryRepository.save(taskEntry);

        task.isDone = true;
        return task;
    }

    @Authorized()
    @Mutation(() => Task, { nullable: true, description: 'Mark task as not done' })
    public async markTaskAsNotDone(@Arg('taskEntry') taskEntryInput: TaskEntryInput): Promise<Task> {
        const task = await this.taskRepository.findOne(taskEntryInput.taskId);
        if (!task) {
            return null;
        }

        const start = DateHelper.getStartOfPeriod(taskEntryInput.when, task.specificDateType);
        const end = DateHelper.getEndOfPeriod(taskEntryInput.when, task.specificDateType);

        const taskEntry = await this.taskEntryRepository.find({
            where: {
                task,
                whenDone: Between(start, end),
            },
        });

        await this.taskEntryRepository.remove(taskEntry);
        return task;
    }

    @Authorized()
    @Mutation(() => Task, { nullable: true, description: 'Mark task as done' })
    public async delayTask(
        @Arg('taskEntryDelay') taskEntryDelayInput: TaskEntryDelayInput,
        @Ctx() ctx: Context
    ): Promise<Task> {
        const task = await this.taskRepository.findOne(taskEntryDelayInput.taskId);
        if (!task) {
            return null;
        }

        const entry = await this.taskEntryService.findEntry(task, taskEntryDelayInput.when);
        if (entry) {
            return task;
        }

        const taskEntry = new TaskEntry();
        taskEntry.task = task;
        taskEntry.whenDone = taskEntryDelayInput.when;
        taskEntry.type = TaskEntryType.Delayed;
        await this.taskEntryRepository.save(taskEntry);

        task.isDelayed = true;

        const newTask = new Task();
        newTask.name = task.name;
        newTask.detail = task.detail;
        newTask.user = ctx.userIdentity.user;
        newTask.specificDateType = taskEntryDelayInput.specificDateType;
        newTask.specificDateValue = taskEntryDelayInput.specificDateValue;
        newTask.specificTimeValue = taskEntryDelayInput.specificTimeValue;
        await this.taskRepository.save(newTask);

        return task;
    }
}
