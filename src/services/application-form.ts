import * as boom from 'boom';
import * as _ from 'lodash';
import { validate } from '../validations/index';

import * as helper from '../utils/helper';
import * as joiSchema from '../validations/schemas/application';
import * as applicationRepo from '../repositories/application';
import * as applicationFormSectionRepo from '../repositories/application-form-section';
import * as applicationFormFieldRepo from '../repositories/application-form-field';
import * as userRepo from '../repositories/user';
import { IApplicationInstance, IApplicationAttributes } from '../models/application';
import { IApplicationFormSectionInstance, IApplicationFormSectionAttributes } from '../models/application-form-section';
import { IApplicationFormFieldInstance } from '../models/application-form-field';
import { Role } from '../enum/role';

export const getByApplicationId = async (applicationId: string): Promise<IApplicationFormSectionInstance[]> => {
    const application = await applicationRepo.findById(applicationId);
    if (!application) {
        throw boom.badRequest('Invalid application id');
    }
    return applicationFormSectionRepo.getByApplicationId(applicationId);
};

export const getApplicationSectionById =
    async (applicationId: string, sectionId: string): Promise<IApplicationFormSectionInstance> => {
    const application = await applicationRepo.findById(applicationId);
    if (!application) {
        throw boom.badRequest('Invalid application id');
    }
    const formSection = await applicationFormSectionRepo.findById(sectionId);
    if (!formSection) {
        throw boom.badRequest('Invalid application section id');
    }
    return formSection;
};

export const getApplicationFormFieldById =
    async (applicationId: string, fieldId: string) => {
    const application = await applicationRepo.findById(applicationId);
    if (!application) {
        throw boom.badRequest('Invalid application id');
    }
    const formFeild = await applicationFormFieldRepo.findById(fieldId);
    if (!formFeild) {
        throw boom.badRequest('Invalid application form field id');
    }
    return formFeild;
};

export const saveApplicationForm = async (applicationId: string,
                                          applicationForms: IApplicationFormSectionAttributes[]) => {
    await validate({ payload: applicationForms }, joiSchema.saveApplicationFormArray);
    const savedApp = await applicationRepo.findById(applicationId);
    if (!savedApp) {
        throw boom.badRequest('Invalid application id');
    }
    const ids: any = _.reject(applicationForms.map(form => form.id), helper.rejectUndefinedOrNull);
    const applicationSections = await applicationFormSectionRepo.findByIds(ids);
    if (applicationSections.length !== ids.length) {
        throw boom.badRequest('Invalid application section id');
    }
    let formIds = _.pick(applicationForms.map(form => form.applicationFormFields), 'id') as string[];
    formIds = _.reject(formIds, _.isUndefined);
    const savedApplicationForms = await applicationFormFieldRepo.findByIds(formIds);
    if (savedApplicationForms.length !== formIds.length) {
        throw boom.badRequest('Invalid application form id');
    }
    let formSectionIndex = 1;
    let formFieldIndex = 1;
    for (const form of applicationForms) {
        form.applicationId = applicationId;
        form.order = formSectionIndex;
        const section = await applicationFormSectionRepo.saveApplicationFormSection(form);
        if (!form.applicationFormFields) {
            continue;
        }
        for (const field of form.applicationFormFields) {
            field.applicationFormSectionId = section.id;
            field.order = formFieldIndex;
            await applicationFormFieldRepo.saveApplicationFormField(field);
            formFieldIndex += 1;
        }
        formSectionIndex += 1;
    }
    return getByApplicationId(applicationId);
};
