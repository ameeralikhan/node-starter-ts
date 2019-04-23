import * as boom from 'boom';
import { validate } from '../validations/index';

import * as joiSchema from '../validations/schemas/department';
import * as departmentRepo from '../repositories/department';
import * as userRepo from '../repositories/user';
import { IDepartmentInstance, IDepartmentAttributes } from '../models/department';

export const getAll = async (): Promise<IDepartmentInstance[]> => {
    return departmentRepo.getAll();
};

export const saveDepartment = async (department: IDepartmentAttributes) => {
    await validate(department, joiSchema.saveDepartment);
    if (department.userId) {
        const user = await userRepo.findById(department.userId);
        if (!user) {
            throw boom.badRequest('Invalid User');
        }
    }
    await departmentRepo.saveDepartment(department);
    return { success: true };
};
