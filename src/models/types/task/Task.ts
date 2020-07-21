import { Field, ID, ObjectType } from 'type-graphql';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/User';
import { Lazy } from '../../Lazy';
import { DateType } from './DateType';
import { TaskEntryDone } from '../task-entry-done/TaskEntryDone';

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

    @Column()
    @Field()
    public specificDateValue: number;

    @Column({ nullable: true })
    @Field({ nullable: true })
    public specificTimeValue: number;

    @Column()
    @Field()
    public isRecurrent: boolean = false;

    @OneToMany(() => TaskEntryDone, taskEntryDone => taskEntryDone.task, {
        lazy: true,
    })
    public taskEntriesDone: Lazy<TaskEntryDone[]>;

    @Field()
    public isDone: boolean = false;
}
