import * as Sequelize from 'sequelize';

import { Models } from '../models/index';
import { IRoleInstance, IRoleAttributes } from '../models/role';

export const findByName = async (name: string) => {
    return Models.Role.findOne({
        where: {
            name
        }
    });
};
