import * as boom from 'boom';
import { validate } from '../validations/index';

import * as joiSchema from '../validations/schemas/application';
import * as applicationRepo from '../repositories/application';
import * as userRepo from '../repositories/user';
import { IApplicationInstance, IApplicationAttributes } from '../models/application';
import { Role } from '../enum/role';

export const getCurrentLoggedInUserApplications = async (loggedInUserId: string): Promise<IApplicationInstance[]> => {
    return applicationRepo.getByUserId(loggedInUserId);
};

export const getById = async (applicationId: string) => {
    const savedApp = await applicationRepo.findById(applicationId);
    if (!savedApp) {
        throw boom.badRequest('Invalid Application Id');
    }
    return savedApp;
};

export const saveApplication = async (loggedInUserId: string, application: IApplicationAttributes) => {
    await validate(application, joiSchema.saveApplication);
    if (application.id) {
        const savedApp = await applicationRepo.findById(application.id);
        if (!savedApp) {
            throw boom.badRequest('Invalid Application Id');
        }
    } else {
        application.createdBy = loggedInUserId;
    }
    const userIds = application.editableUserIds ? application.editableUserIds.split(',') : [];
    if (userIds && userIds.length) {
        const users = await userRepo.findByIds(userIds);
        if (!users || users.length !== userIds.length) {
            throw boom.badRequest('Invalid User');
        }
    }
    return applicationRepo.saveApplication(application);
};

export const deleteApplication = async (id: string, loggedInUserId: string) => {
    await validate({ id }, joiSchema.deleteApplication);
    const application = await applicationRepo.findById(id);
    if (!application) {
        throw boom.badRequest('Invalid Application Id');
    }
    const deletedAt = new Date();
    const deletedBy = loggedInUserId;
    await applicationRepo.deleteApplication(id, deletedAt, deletedBy);
    return { success: true };
};
