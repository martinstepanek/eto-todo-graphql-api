import { Field, InputType } from 'type-graphql';
import { MaxLength } from 'class-validator';

@InputType()
export class UserInput {
    @Field({ description: 'Google token id' })
    @MaxLength(255)
    public tokenId: string;


}
