import { Field, ID, ObjectType } from 'type-graphql';
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

    @ManyToOne(() => User, user => user.tasks, {
        lazy: true,
        nullable: false,
    })
    @Field(() => User)
    public user: Lazy<User>;

    @Column()
    @Field()
    public name: string;

    @Column({ nullable: true })
    @Field({ nullable: true })
    public detail: string;

    @Column({ type: 'enum', enum: DateType })
    @Field()
    public specificDateType: DateType;

    @Column('datetime')
    @Field(() => Date)
    public specificDateValue: Date;

    @Column({ nullable: true })
    @Field({ nullable: true })
    public specificTimeValue: number;

    @Column()
    @Field()
    public isRecurrent: boolean = false;

    @OneToMany(() => TaskEntry, taskEntryDone => taskEntryDone.task, {
        lazy: true,
    })
    public taskEntriesDone: Lazy<TaskEntry[]>;

    @Field()
    public isDone: boolean = false;

    @Field()
    public isDelayed: boolean = false;
}
