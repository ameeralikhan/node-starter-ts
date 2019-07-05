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

export const getByApplicationId = async (applicationId: string): Promise<IApplicationExecutionInstance[]> => {
    const application = await applicationRepo.findById(applicationId);
    if (!application) {
        throw boom.badRequest('Invalid application id');
    }
    return applicationExecutionRepo.getByApplicationId(applicationId);
};

export const saveApplicationExecution = async (applicationId: string,
                                               applicationExecutions: IApplicationExecutionAttributes[]) => {
    await validate({ payload: applicationExecutions, applicationId }, joiSchema.saveApplicationExecutionArray);
    const savedApp = await applicationRepo.findById(applicationId);
    if (!savedApp) {
        throw boom.badRequest('Invalid application id');
    }
    const ids: any = _.reject(applicationExecutions.map(form => form.id), helper.rejectUndefinedOrNull);
    const savedApplicationExecutions = await applicationExecutionRepo.findByIds(ids);
    if (savedApplicationExecutions.length !== ids.length) {
        throw boom.badRequest('Invalid application execution id');
    }
    let formFieldIds = _.pick(
        applicationExecutions.map(form => form.applicationExecutionForms), 'applicationFormFieldId') as string[];
    formFieldIds = _.reject(formFieldIds, helper.rejectUndefinedOrNull);
    const savedApplicationFormFields = await applicationFormFieldRepo.findByIds(formFieldIds);
    if (savedApplicationFormFields.length !== _.uniq(formFieldIds).length) {
        throw boom.badRequest('Invalid application form field id');
    }
    for (const form of applicationExecutions) {
        form.applicationId = applicationId;
        const execution = await applicationExecutionRepo.saveApplicationExecution(form);
        if (!form.applicationExecutionForms) {
            continue;
        }
        for (const field of form.applicationExecutionForms) {
            field.applicationExecutionId = execution.id;
            await applicationExecutionFormRepo.saveApplicationExecutionForm(field);
        }
    }
    return getByApplicationId(applicationId);
};
