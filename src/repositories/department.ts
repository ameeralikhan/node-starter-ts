import * as Sequelize from 'sequelize';

import { Models } from '../models/index';
import { IDepartmentInstance, IDepartmentAttributes } from '../models/department';

export const getAll = async () => {
    return Models.Department.findAll({
        where: {
            isActive: true
        }
    });
};
