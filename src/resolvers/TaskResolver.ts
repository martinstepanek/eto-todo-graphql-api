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
import { Between, IsNull } from 'typeorm';
import { TaskEntryDelayInput } from '../models/types/task-entry/TaskEntryDelayInput';
import { TaskEntryService } from '../models/services/TaskEntryService';
import { DateType } from '../models/types/task/DateType';
import { TaskEntryDeleteInput } from '../models/types/task-entry/TaskEntryDeleteInput';
import { TaskOperation } from '../models/types/task/TaskOperation';
import { TaskOperationType } from '../models/types/task/TaskOperationType';
import { TaskListService } from '../models/services/TaskListService';

@Resolver(Task)
export class TaskResolver {
    public constructor(
        @InjectRepository() private readonly taskRepository: TaskRepository,
        @InjectRepository() private readonly taskEntryRepository: TaskEntryRepository,
        @Inject('TaskService') private readonly taskService: TaskService,
        @Inject('TaskEntryService') private readonly taskEntryService: TaskEntryService,
        @Inject('TaskListService') private readonly taskListService: TaskListService
    ) {}

    @Authorized()
    @Mutation(() => TaskOperation, { description: 'Create new task' })
    public async createTask(@Arg('task') taskInput: TaskInput, @Ctx() ctx: Context): Promise<TaskOperation> {
        // TODO: add custom validator
        if (
            taskInput.isRecurrent &&
            taskInput.recurrentDateValue == null &&
            taskInput.specificDateType !== DateType.Date
        ) {
            throw new Error(
                'When task is recurrent, recurrentDateValue is required (exception is when specificDateType=Date)'
            );
        }
        if (!taskInput.isRecurrent && taskInput.specificDateValue == null) {
            throw new Error('When task is not recurrent, specificDateValue is required');
        }

        const task = this.taskRepository.create(taskInput);
        task.user = ctx.userIdentity.user;
        const newTask = await this.taskRepository.save(task);

        return {
            operationType: TaskOperationType.Create,
            task: newTask,
            inLists: this.taskListService.getInListsByTask(newTask),
        };
    }

    @Authorized()
    @Mutation(() => Task, { nullable: true, description: 'Edit existing task' })
    public async editTask(
        @Arg('taskId') taskId: string,
        @Arg('task') taskInput: TaskInput,
        @Ctx() ctx: Context
    ): Promise<Task> {
        // TODO: add custom validator
        if (taskInput.isRecurrent && taskInput.recurrentDateValue == null) {
            throw new Error('When task is recurrent, recurrentDateValue is required');
        }
        if (!taskInput.isRecurrent && taskInput.specificDateValue == null) {
            throw new Error('When task is not recurrent, specificDateValue is required');
        }

        const task = await this.taskRepository.findOne({
            where: {
                taskId,
                deletedAt: IsNull(),
            },
        });
        if (!task) {
            return null;
        }

        task.name = taskInput.name;
        task.detail = taskInput.detail;
        task.specificDateType = taskInput.specificDateType;
        task.specificDateValue = taskInput.specificDateValue;
        task.specificTimeValue = taskInput.specificTimeValue;
        task.isRecurrent = taskInput.isRecurrent;
        await this.taskRepository.save(task);

        return task;
    }

    @Authorized()
    @Query(() => [Task], { description: 'Get tasks by list type' })
    public async tasks(
        @Arg('listType', () => TaskListType) listType: TaskListType,
        @Ctx() ctx: Context
    ): Promise<Task[]> {
        return this.taskService.getMarkedTasksByListType(listType, ctx.userIdentity.user);
    }

    @Authorized()
    @Mutation(() => TaskOperation, { nullable: true, description: 'Mark task as done' })
    public async markTaskAsDone(@Arg('taskEntry') taskEntryInput: TaskEntryInput): Promise<TaskOperation> {
        const task = await this.taskRepository.findOne({
            where: {
                taskId: taskEntryInput.taskId,
                deletedAt: IsNull(),
            },
        });
        if (!task) {
            return null;
        }

        const entry = await this.taskEntryService.findEntry(task, taskEntryInput.when);

        const operation =  {
            operationType: TaskOperationType.MarkAsDone,
            task,
            inLists: this.taskListService.getInListsByDate(taskEntryInput.when),
        };

        if (entry) {
            return operation;
        }

        const taskEntry = new TaskEntry();
        taskEntry.task = task;
        taskEntry.whenDone = taskEntryInput.when;
        taskEntry.type = TaskEntryType.Done;
        await this.taskEntryRepository.save(taskEntry);

        task.isDone = true;
        return operation;
    }

    @Authorized()
    @Mutation(() => TaskOperation, { nullable: true, description: 'Mark task as not done' })
    public async markTaskAsNotDone(@Arg('taskEntry') taskEntryInput: TaskEntryInput): Promise<TaskOperation> {
        const task = await this.taskRepository.findOne({
            where: {
                taskId: taskEntryInput.taskId,
                deletedAt: IsNull(),
            },
        });
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
        return {
            operationType: TaskOperationType.MarkAsNotDone,
            task,
            inLists: this.taskListService.getInListsByDate(taskEntryInput.when),
        };
    }

    @Authorized()
    @Mutation(() => Task, { nullable: true, description: 'Mark task as done' })
    public async delayTask(
        @Arg('taskEntryDelay') taskEntryDelayInput: TaskEntryDelayInput,
        @Ctx() ctx: Context
    ): Promise<Task> {
        const task = await this.taskRepository.findOne({
            where: {
                taskId: taskEntryDelayInput.taskId,
                deletedAt: IsNull(),
            },
        });
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

    @Authorized()
    @Mutation(() => Task, { nullable: true, description: 'Mark task as done' })
    public async deleteTask(
        @Arg('taskEntryDelay') taskEntryDeleteInput: TaskEntryDeleteInput,
        @Ctx() ctx: Context
    ): Promise<Task> {
        const task = await this.taskRepository.findOne({
            where: {
                taskId: taskEntryDeleteInput.taskId,
                deletedAt: IsNull(),
            },
        });
        if (!task) {
            return null;
        }

        const entry = await this.taskEntryService.findEntry(task, taskEntryDeleteInput.when);
        // done tasks can be deleted
        if (entry && entry.type !== TaskEntryType.Done) {
            return task;
        }

        if (task.isRecurrent && taskEntryDeleteInput.allRecurringTasks) {
            task.deletedAt = new Date();
            await this.taskRepository.save(task);
        } else {
            const taskEntry = new TaskEntry();
            taskEntry.task = task;
            taskEntry.whenDone = taskEntryDeleteInput.when;
            taskEntry.type = TaskEntryType.Deleted;
            await this.taskEntryRepository.save(taskEntry);
        }

        task.isDeleted = true;
        return task;
    }
}
