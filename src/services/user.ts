import * as boom from 'boom';
import * as _ from 'lodash';
import * as encryption from '../utils/encryption';
import * as userRepo from '../repositories/user';
import * as joiSchema from '../validations/schemas/user';
import { IUserRequest } from '../interface/user';
import { validate } from './../validations/index';
import { IUserAttributes, IUserInstance } from '../models/user';
import { IUserRoleAttributes } from './../models/user-role';

export const findById = async (userId: string) => {
    await validate({ userId }, joiSchema.getUserById);
    const user =  userRepo.findById(userId);
    if (!user) {
        throw boom.badRequest('Invalid user id');
    }
    return user;
};

export const getAll = async () => {
    return userRepo.getAll();
};

export const saveUser = async (payload: IUserRequest) => {
    await validate(payload, joiSchema.userRequest);
    const existingUser = await userRepo.findByEmail(payload.email);
    if (existingUser && existingUser.id !== payload.id) {
        throw boom.badRequest('User already exist with same email');
    }
    if (payload.id) {
        const editUser = await userRepo.findById(payload.id);
        if (!editUser) {
            throw boom.badRequest('Invalid user id');
        }
    }
    let user: Partial<IUserRequest> = {
      id: payload.id,
      firstName: payload.firstName,
      lastName: payload.lastName,
      country: payload.country,
      city: payload.city,
      contactNo: payload.contactNo,
      email: payload.email,
      pictureUrl: payload.pictureUrl || undefined,
      gender: payload.gender,
      timezone: payload.timezone || undefined,
    };
    if (payload.password) {
        const encryptedPassword = encryption.saltHashPassword(payload.password);
        user.password = encryptedPassword;
    }
    user = _.omitBy(user, _.isUndefined);
    const savedUser = await userRepo.upsertUser(user);
    const userRoles: IUserRoleAttributes[] = [];
    payload.roleIds.forEach((roleId) => {
        userRoles.push({
            userId: savedUser[0].id,
            roleId,
            isActive: true
        });
    });
    await userRepo.deleteUserRoles(savedUser[0].id);
    await userRepo.saveUserRoles(userRoles);
    return { success: true };
};
