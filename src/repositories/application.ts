import * as Sequelize from 'sequelize';

import { Models } from '../models/index';
import { IApplicationInstance, IApplicationAttributes } from '../models/application';

export const getAll = async () => {
    return Models.Application.findAll({
        attributes: ['id', 'name', 'shortDescription', 'userIds', 'canAllStart', 'canAllEdits', 'editableUserIds',
         'createdAt', 'updatedAt'],
        where: {
            isActive: true,
            deletedAt: null
        },
    });
};

export const getByUserId = async (userId: string) => {
    return Models.Application.findAll({
        attributes: ['id', 'name', 'shortDescription', 'userIds', 'canAllStart', 'canAllEdits', 'editableUserIds',
         'createdAt', 'updatedAt'],
        where: {
            isActive: true,
            deletedAt: null,
            createdBy: userId
        },
    });
};

export const getCount = async () => {
    return Models.Application.count({
        where: {
            isActive: true
        }
    });
};

export const findById = async (id: string) => {
    return Models.Application.findOne({ where: { id }});
};

export const saveApplication = async (application: IApplicationAttributes) => {
    return Models.Application.insertOrUpdate(application);
};

export const deleteApplication = async (id: string, deletedAt: Date, deletedBy: string) => {
    return Models.Application.update({ isActive: false, deletedAt, deletedBy }, { where: { id }});
};
