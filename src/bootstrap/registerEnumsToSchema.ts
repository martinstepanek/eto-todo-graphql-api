import { TaskListType } from '../models/types/task/TaskListType';
import { registerEnumType } from 'type-graphql';
import { DateType } from '../models/types/task/DateType';

export const registerEnumsToSchema = () => {
    registerEnumType(TaskListType, {
        name: 'TaskListType',
    });

    registerEnumType(DateType, {
        name: 'DateType',
    });
};
