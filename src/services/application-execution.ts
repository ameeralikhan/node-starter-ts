import * as boom from 'boom';
import * as _ from 'lodash';
import { validate } from '../validations/index';

import * as helper from '../utils/helper';
import * as joiSchema from '../validations/schemas/application';
import * as applicationRepo from '../repositories/application';
import * as applicationFormFieldRepo from '../repositories/application-form-field';
import * as applicationExecutionRepo from '../repositories/application-execution';
import * as applicationExecutionFormRepo from '../repositories/application-execution-form';
import * as userRepo from '../repositories/user';
import { IApplicationInstance, IApplicationAttributes } from '../models/application';
import { IApplicationExecutionInstance, IApplicationExecutionAttributes } from '../models/application-execution';
import { IApplicationFormFieldInstance } from '../models/application-form-field';
import { Role } from '../enum/role';
import { ApplicationExecutionStatus } from '../enum/application';

export const getAll = async (): Promise<IApplicationExecutionInstance[]> => {
    return applicationExecutionRepo.getAll();
};

export const getById = async (executionId: string): Promise<IApplicationExecutionInstance> => {
    const execution = await applicationExecutionRepo.findById(executionId);
    if (!execution) {
        throw boom.badRequest('Invalid execution id');
    }
    return execution;
};

export const getByApplicationId = async (applicationId: string): Promise<IApplicationExecutionInstance[]> => {
    const application = await applicationRepo.findById(applicationId);
    if (!application) {
        throw boom.badRequest('Invalid application id');
    }
    return applicationExecutionRepo.getByApplicationId(applicationId);
};

export const saveApplicationExecution = async (applicationId: string,
                                               applicationExecution: IApplicationExecutionAttributes) => {
    await validate(applicationExecution, joiSchema.saveApplicationExecution);
    const savedApp = await applicationRepo.findById(applicationId);
    if (!savedApp) {
        throw boom.badRequest('Invalid application id');
    }
    if (applicationExecution.id) {
        const savedApplicationExecution = await applicationExecutionRepo.findById(applicationExecution.id);
        if (!savedApplicationExecution) {
            throw boom.badRequest('Invalid application execution id');
        }
        applicationExecution.startedAt = savedApplicationExecution.startedAt;
        applicationExecution.status = savedApplicationExecution.status;
    } else {
        applicationExecution.startedAt = new Date();
        applicationExecution.status = ApplicationExecutionStatus.DRAFT;
    }
    let formFieldIds = _.pick(applicationExecution.applicationExecutionForms, 'applicationFormFieldId') as string[];
    formFieldIds = _.reject(formFieldIds, helper.rejectUndefinedOrNull);
    const savedApplicationFormFields = await applicationFormFieldRepo.findByIds(formFieldIds);
    if (savedApplicationFormFields.length !== _.uniq(formFieldIds).length) {
        throw boom.badRequest('Invalid application form field id');
    }
    // validation for required in form fields
    applicationExecution.applicationId = applicationId;
    const execution = await applicationExecutionRepo.saveApplicationExecution(applicationExecution);
    if (!applicationExecution.applicationExecutionForms) {
        return getByApplicationId(applicationId);
    }
    for (const field of applicationExecution.applicationExecutionForms) {
        field.applicationExecutionId = execution.id;
        await applicationExecutionFormRepo.saveApplicationExecutionForm(field);
    }
    return getByApplicationId(applicationId);
};

export const deleteApplicationExecution = async (id: string) => {
    const applicationExecution = await applicationExecutionRepo.findById(id);
    if (!applicationExecution) {
        throw boom.badRequest('Invalid application execution id');
    }
    await applicationExecutionRepo.deleteApplicationExecution(id);
    return { success: true };
};
