import * as Sequelize from 'sequelize';

import { Models } from '../models/index';
import { IGroupInstance, IGroupAttributes } from '../models/group';

export const getAll = async () => {
    return Models.Group.findAll({
        where: {
            isActive: true
        },
        include: [Models.UserGroup]
    });
};
