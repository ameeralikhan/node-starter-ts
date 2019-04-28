import * as Sequelize from 'sequelize';

import { Models } from '../models/index';
import { IUserInstance, IUserAttributes } from './../models/user';

export const authenticate = async (email: string, password: string) => {
    return Models.User.findOne({
        where: {
            email,
            password
        },
        include: [{
            model: Models.Role,
            attributes: ['id', 'name']
        }]
    });
};

export const getActiveUserCount = async () => {
    return Models.User.count({
        where: {
            isActive: true
        }
    });
};

export const getInActiveUserCount = async () => {
    return Models.User.count({
        where: {
            isActive: false
        }
    });
};

export const getAll = async () => {
    return Models.User.findAll({
        where: {
            isActive: true
        },
    });
};

export const findById = async (id: string) => {
    return Models.User.findOne({
        where: {
            id
        },
        include: [Models.Role]
    });
};

export const findByIds = async (id: string[]) => {
    return Models.User.findAll({
        where: {
            id: {
                [Sequelize.Op.in]: id
            }
        },
        include: [Models.Role]
    });
};

export const findByEmail = async (email: string) => {
    return Models.User.findOne({
        where: {
            email
        },
        include: [Models.Role]
    });
};

export const saveUser = async (user: any) => {
    return Models.User.create(user);
};

export const updateUser = async (id: string, user: any) => {
    return Models.User.update(user, { where: { id }});
};
