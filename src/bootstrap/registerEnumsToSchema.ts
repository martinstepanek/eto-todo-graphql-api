import { TaskListType } from '../models/types/task/TaskListType';
import { registerEnumType } from 'type-graphql';
import { DateType } from '../models/types/task/DateType';
import { TaskOperationType } from '../models/types/task/TaskOperationType';

export const registerEnumsToSchema = () => {
    registerEnumType(TaskListType, {
        name: 'TaskListType',
    });

    registerEnumType(DateType, {
        name: 'DateType',
    });

    registerEnumType(TaskOperationType, {
        name: 'TaskOperationType',
    });
};
