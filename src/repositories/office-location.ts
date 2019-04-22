import * as Sequelize from 'sequelize';

import { Models } from '../models/index';
import { IOfficeLocationInstance, IOfficeLocationAttributes } from '../models/office-location';

export const getAll = async () => {
    return Models.OfficeLocation.findAll({
        where: {
            isActive: true
        }
    });
};
