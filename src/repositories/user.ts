import { IUserRoleInstance, IUserRoleAttributes } from './../models/user-role';
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
            model: Models.UserRole,
            include: [{
                model: Models.Role,
                attributes: ['id', 'name']
            }],
            attributes: ['id', 'userId', 'roleId']
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
        attributes: ['id', 'firstName', 'lastName', 'email', 'contactNo', 'gender', 'createdAt', 'updatedAt'],
        where: {
            isActive: true
        },
    });
};

export const findById = async (id: string) => {
    return Models.User.findOne({
        attributes: ['id', 'firstName', 'lastName', 'email', 'contactNo', 'gender', 'createdAt', 'updatedAt'],
        where: {
            id
        },
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
    });
};

export const saveUser = async (user: any) => {
    return Models.User.create(user);
};

export const upsertUser = async (user: any) => {
    return Models.User.insertOrUpdate(user, { returning: true });
};

export const saveUserRoles = async (userRoles: any) => {
    return Models.UserRole.bulkCreate(userRoles);
};

export const updateUser = async (id: string, user: any) => {
    return Models.User.update(user, { where: { id }});
};

export const deleteUserRoles = async (userId: string) => {
    return Models.UserRole.destroy({ where: { userId }});
};
