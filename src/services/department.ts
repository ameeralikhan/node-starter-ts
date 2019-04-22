import * as boom from 'boom';
import * as _ from 'lodash';
import * as departmentRepo from '../repositories/department';
import * as joiSchema from '../validations/schemas/user';
import { IUserRequest } from '../interface/user';
import { validate } from './../validations/index';
import { IDepartmentInstance } from '../models/department';

export const getAll = async (): Promise<IDepartmentInstance[]> => {
    return departmentRepo.getAll();
};
