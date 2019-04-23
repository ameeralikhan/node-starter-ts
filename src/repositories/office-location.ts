import * as Sequelize from 'sequelize';

import { Models } from '../models/index';
import { IOfficeLocationInstance, IOfficeLocationAttributes } from '../models/office-location';

export const getAll = async () => {
    return Models.OfficeLocation.findAll({
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

export const saveOfficeLocation = async (officeLocation: IOfficeLocationAttributes) => {
    return Models.OfficeLocation.insertOrUpdate(officeLocation);
};
