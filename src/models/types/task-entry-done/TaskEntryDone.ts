import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Lazy } from '../../Lazy';
import { Task } from '../task/Task';

@Entity()
export class TaskEntryDone {
    @PrimaryGeneratedColumn('uuid')
    public taskEntryDoneId: string;

    @ManyToOne(() => Task, task => task.taskEntriesDone, {
        lazy: true,
        nullable: false,
    })
    public task: Lazy<Task>;

    @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
    public whenDone: Date;

    @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
    public whenRealDone: Date;
}
