import * as boom from 'boom';
import * as _ from 'lodash';
import { validate } from '../validations/index';

import * as joiSchema from '../validations/schemas/application';
import * as applicationRepo from '../repositories/application';
import * as applicationFormSectionRepo from '../repositories/application-form-section';
import * as applicationFormFieldRepo from '../repositories/application-form-field';
import * as userRepo from '../repositories/user';
import { IApplicationInstance, IApplicationAttributes } from '../models/application';
import { IApplicationFormSectionInstance, IApplicationFormSectionAttributes } from '../models/application-form-section';
import { Role } from '../enum/role';

export const getByApplicationId = async (applicationId: string): Promise<IApplicationFormSectionInstance[]> => {
    const application = await applicationRepo.findById(applicationId);
    if (!application) {
        throw boom.badRequest('Invalid application id');
    }
    return applicationFormSectionRepo.getByApplicationId(applicationId);
};

export const saveApplicationForm = async (applicationId: string,
                                          applicationForms: IApplicationFormSectionAttributes[]) => {
    await validate({ payload: applicationForms }, joiSchema.saveApplicationFormArray);
    const savedApp = await applicationRepo.findById(applicationId);
    if (!savedApp) {
        throw boom.badRequest('Invalid application id');
    }
    const ids = _.reject(applicationForms.map(form => form.id), _.isUndefined);
    const applicationSections = await applicationFormSectionRepo.findByIds(ids);
    if (applicationSections.length !== ids.length) {
        throw boom.badRequest('Invalid application section id');
    }
    const formIds = _.pick(applicationForms.map(form => form.applicationFormFields), 'id') as string[];
    const savedApplicationForms = await applicationFormFieldRepo.findByIds(formIds);
    if (savedApplicationForms.length !== formIds.length) {
        throw boom.badRequest('Invalid application form id');
    }
    await Promise.all(applicationForms.map(form => {
        form.applicationId = applicationId;
        return applicationFormSectionRepo.saveApplicationFormSection(form);
    }));
    return { success: true };
};
