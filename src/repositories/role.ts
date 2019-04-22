import * as Sequelize from 'sequelize';

import { Models } from '../models/index';
import { IRoleInstance, IRoleAttributes } from '../models/role';

export const getAll = async () => {
    return Models.Role.findAll({
        where: {
            isActive: true
        }
    });
};

export const findByName = async (name: string) => {
    return Models.Role.findOne({
        where: {
            name
        }
    });
};
