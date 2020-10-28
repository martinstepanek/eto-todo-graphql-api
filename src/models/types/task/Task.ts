import { Field, ID, Int, ObjectType } from 'type-graphql';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/User';
import { Lazy } from '../../Lazy';
import { DateType } from './DateType';
import { TaskEntry } from '../task-entry/TaskEntry';

@Entity()
@ObjectType()
export class Task {
    @PrimaryGeneratedColumn('uuid')
    @Field(() => ID)
    public taskId: string;

    @ManyToOne(
        () => User,
        user => user.tasks,
        {
            lazy: true,
            nullable: false,
        }
    )
    @Field(() => User)
    public user: Lazy<User>;

    @Column()
    @Field()
    public name: string;

    @Column({ nullable: true, type: 'text' })
    @Field({ nullable: true })
    public detail: string;

    @Column({ type: 'enum', enum: DateType })
    @Field(() => DateType)
    public specificDateType: DateType;

    @Column('datetime', { nullable: true })
    @Field(() => Date, { nullable: true })
    public specificDateValue: Date;

    @Column({ nullable: true })
    @Field({ nullable: true })
    public specificTimeValue: number;

    @Column()
    @Field()
    public isRecurrent: boolean = false;

    @Column({ nullable: true })
    @Field(() => Int, { nullable: true })
    public recurrentDateValue: number;

    @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
    public createdAt: Date;

    @Column('datetime', { nullable: true })
    public deletedAt: Date;

    @OneToMany(
        () => TaskEntry,
        taskEntry => taskEntry.task,
        {
            lazy: true,
        }
    )
    public taskEntries: Lazy<TaskEntry[]>;

    @Field()
    public isDone: boolean = false;

    @Field()
    public isDelayed: boolean = false;

    @Field()
    public isDeleted: boolean = false;
}
