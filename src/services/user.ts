import * as boom from 'boom';
import * as _ from 'lodash';
import * as userRepo from '../repositories/user';
import * as joiSchema from '../validations/schemas/user';
import { IUserRequest } from '../interface/user';
import { validate } from './../validations/index';

export const findById = async (userId: string) => {
    return userRepo.findById(userId);
};

export const saveUser = async (userId: string, payload: IUserRequest) => {
    await validate(payload, joiSchema.userRequest);
    let user: Partial<IUserRequest> = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      country: payload.country,
      city: payload.city,
      contactNo: payload.contactNo,
      pictureUrl: payload.pictureUrl || undefined,
      gender: payload.gender,
      timezone: payload.timezone || undefined,
    };
    user = _.omitBy(user, _.isUndefined);
    await userRepo.updateUser(userId, user);
    return { success: true };
};
