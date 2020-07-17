import { Field, ID, ObjectType } from 'type-graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class User {
    @PrimaryGeneratedColumn('uuid')
    @Field(() => ID)
    public userId: string;

    @Column({ unique: true })
    @Field()
    public name: string;

    @Column()
    @Field()
    public state: string;

    @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
    public createdAt: Date;

    @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
    public updatedAt: Date;
}
