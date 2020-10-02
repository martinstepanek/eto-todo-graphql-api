import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Lazy } from '../../Lazy';
import { Task } from '../task/Task';
import { Field } from 'type-graphql';
import { TaskEntryType } from './TaskEntryType';

@Entity()
export class TaskEntry {
    @PrimaryGeneratedColumn('uuid')
    public taskEntryId: string;

    @ManyToOne(
        () => Task,
        task => task.taskEntries,
        {
            lazy: true,
            nullable: false,
        }
    )
    public task: Lazy<Task>;

    @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
    public whenDone: Date;

    @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
    public whenRealDone: Date;

    @Column({ type: 'enum', enum: TaskEntryType })
    @Field()
    public type: TaskEntryType;
}
