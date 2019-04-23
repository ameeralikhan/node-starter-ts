import * as Sequelize from 'sequelize';

import { Models } from '../models/index';
import { IDepartmentInstance, IDepartmentAttributes } from '../models/department';

export const getAll = async () => {
    return Models.Department.findAll({
        attributes: ['id', 'name', 'userId'],
        where: {
            isActive: true
        },
        include: [{
            model: Models.User,
            attributes: ['id', 'firstName', 'lastName']
        }]
    });
};

export const saveDepartment = async (department: IDepartmentAttributes) => {
    return Models.Department.insertOrUpdate(department);
};
