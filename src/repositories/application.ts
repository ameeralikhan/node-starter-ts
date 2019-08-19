import * as Sequelize from 'sequelize';

import { Models } from '../models/index';
import { IApplicationInstance, IApplicationAttributes } from '../models/application';

export const getAll = async () => {
    return Models.Application.findAll({
        attributes: ['id', 'name', 'shortDescription', 'userIds', 'canAllStart', 'canAllEdits', 'editableUserIds',
        'isPublished', 'createdAt', 'updatedAt'],
        where: {
            isActive: true,
            deletedAt: null
        },
    });
};

export const getByUserId = async (userId: string) => {
    return Models.Application.findAll({
        attributes: ['id', 'name', 'shortDescription', 'userIds', 'canAllStart', 'canAllEdits', 'editableUserIds',
         'isPublished', 'createdBy', 'createdAt', 'updatedAt'],
        where: {
            isActive: true,
            deletedAt: null,
            [Sequelize.Op.or]: {
                canAllStart: true,
                createdBy: userId,
                userIds: {
                    [Sequelize.Op.like]: `%${userId}%`
                }
            },
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
    return Models.Application.insertOrUpdate(application, { returning: true})
        .then((res) => res[0]);
};

export const publishApplication = async (id: string, editableUserIds: string, canAllEdits: boolean) => {
    return Models.Application.update({ isPublished: true, editableUserIds, canAllEdits }, { where: { id }})
        .then((res) => res[0]);
};

export const deleteApplication = async (id: string, deletedAt: Date, deletedBy: string) => {
    return Models.Application.update({ isActive: false, deletedAt, deletedBy }, { where: { id }});
};
