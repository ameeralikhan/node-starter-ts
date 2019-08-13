import * as boom from 'boom';
import * as _ from 'lodash';
import { validate } from '../validations/index';

import * as helper from '../utils/helper';
import * as joiSchema from '../validations/schemas/application';
import * as applicationRepo from '../repositories/application';
import * as applicationWorkflowRepo from '../repositories/application-workflow';
import * as applicationFormFieldRepo from '../repositories/application-form-field';
import * as applicationExecutionRepo from '../repositories/application-execution';
import * as applicationExecutionFormRepo from '../repositories/application-execution-form';
import * as applicationExecutionWorkflowRepo from '../repositories/application-execution-workflow';
import * as userRepo from '../repositories/user';
import { IApplicationInstance, IApplicationAttributes } from '../models/application';
import { IApplicationExecutionInstance, IApplicationExecutionAttributes } from '../models/application-execution';
import { IApplicationFormFieldInstance } from '../models/application-form-field';
import { Role } from '../enum/role';
import { ApplicationExecutionStatus } from '../enum/application';
import { IApplicationExecutionWorkflowAttributes } from '../models/application-execution-workflow';

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

export const getExecutionByLoggedInUserId =
    async (loggedInUserId: string, status?: string): Promise<IApplicationExecutionInstance[]> => {
    await validate({ loggedInUserId, status }, joiSchema.getExecutionByLoggedInUserId);
    if (status === ApplicationExecutionStatus.DRAFT) {
        return applicationExecutionRepo.getDraftApplicationExecutions(loggedInUserId);
    } else {
        return applicationExecutionRepo.getApplicationExecutionsForApproval(loggedInUserId);
    }
};

export const getExecutionInProcessLoggedInUserId =
    async (loggedInUserId: string, status: string): Promise<IApplicationExecutionInstance[]> => {
    await validate({ loggedInUserId, status }, joiSchema.getExecutionInProcessLoggedInUserId);
    return applicationExecutionRepo.getApplicationExecutionInProcess(loggedInUserId, status);
};

export const saveApplicationExecution = async (applicationId: string,
                                               loggedInUserId: string,
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
        if (savedApplicationExecution.status === ApplicationExecutionStatus.APPROVED) {
            throw boom.badRequest('Application execution is already published');
        }
        applicationExecution.startedAt = savedApplicationExecution.startedAt;
        applicationExecution.status = savedApplicationExecution.status;
        applicationExecution.updatedBy = loggedInUserId;
    } else {
        applicationExecution.startedAt = new Date();
        applicationExecution.status = ApplicationExecutionStatus.DRAFT;
        applicationExecution.createdBy = loggedInUserId;
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

export const publishApplicationExecution = async (applicationId: string,
                                                  loggedInUserId: string,
                                                  applicationExecutionId: string) => {
    await validate({ applicationId, applicationExecutionId }, joiSchema.publishApplicationExecution);
    const savedApp = await applicationRepo.findById(applicationId);
    if (!savedApp) {
        throw boom.badRequest('Invalid application id');
    }
    const savedApplicationExecution = await applicationExecutionRepo.findById(applicationExecutionId);
    if (!savedApplicationExecution) {
        throw boom.badRequest('Invalid application execution id');
    }
    if (savedApplicationExecution.status === ApplicationExecutionStatus.APPROVED) {
        throw boom.badRequest('Application execution is already published');
    }
    await applicationExecutionRepo.saveApplicationExecution({
        id: savedApplicationExecution.id,
        applicationId: savedApplicationExecution.applicationId,
        startedAt: savedApplicationExecution.startedAt,
        status: ApplicationExecutionStatus.APPROVED,
        updatedBy: loggedInUserId
     });
    const workflows = await applicationWorkflowRepo.getByApplicationId(applicationId);
    if (workflows && workflows.length) {
        const payload: IApplicationExecutionWorkflowAttributes = {
            applicationExecutionId,
            applicationWorkflowId: workflows[0].id,
            status: ApplicationExecutionStatus.DRAFT,
            createdBy: loggedInUserId
        };
        await applicationExecutionWorkflowRepo.saveApplicationExecutionWorkflow(payload);
    }
    return { success: true };
};

export const saveApplicationExecutionWorkflow =
    async (applicationId: string, loggedInUserId: string, payload: IApplicationExecutionWorkflowAttributes) => {
    await validate({ applicationId, ...payload }, joiSchema.saveApplicationExecutionWorkflow);
    const savedApp = await applicationRepo.findById(applicationId);
    if (!savedApp) {
        throw boom.badRequest('Invalid application id');
    }
    const savedApplicationExecution = await applicationExecutionRepo.findById(payload.applicationExecutionId);
    if (!savedApplicationExecution) {
        throw boom.badRequest('Invalid application execution id');
    }
    if (!payload.id) {
        throw boom.badRequest('Invalid id');
    }
    const savedExecutionWorkflow = await applicationExecutionWorkflowRepo.findById(payload.id);
    if (!savedExecutionWorkflow) {
        throw boom.badRequest('Invalid id');
    }
    let toSave = savedExecutionWorkflow.get({ plain: true });
    const user = await userRepo.findById(loggedInUserId);
    if (!user) {
        throw boom.badRequest('Invalid user');
    }
    if (toSave.status === ApplicationExecutionStatus.APPROVED ||
        toSave.status === ApplicationExecutionStatus.REJECT) {
        throw boom.badRequest('Execution is already approved or reject, cannot be modified now');
    }
    if (payload.comments) {
        for (const comment of payload.comments) {
            comment.userId = comment.userId || user.id;
            comment.userName = comment.userName || `${user.firstName} ${user.lastName}`;
        }
    }
    if (payload.status === ApplicationExecutionStatus.REJECT) {
        payload.comments = payload.comments || [];
        payload.comments.unshift({
            userId: user.id,
            time: new Date(),
            comment: payload.rejectionDetails.comment,
            userName: `${user.firstName} ${user.lastName}`
        });
    }
    toSave = {
        id: toSave.id,
        applicationExecutionId: toSave.applicationExecutionId,
        applicationWorkflowId: toSave.applicationWorkflowId,
        updatedBy: loggedInUserId,
        ...payload
    };
    await applicationExecutionWorkflowRepo.saveApplicationExecutionWorkflow(toSave);
    if (payload.status === ApplicationExecutionStatus.APPROVED) {
        // move workflow to the next
        const applicationWorkflows = await applicationWorkflowRepo.getByApplicationId(applicationId);
        const indexOfWorkflow = applicationWorkflows.findIndex(col => col.id === toSave.applicationWorkflowId);
        if (indexOfWorkflow > -1 && applicationWorkflows.length >= indexOfWorkflow + 1) {
            const newExecutionWorkflow: IApplicationExecutionWorkflowAttributes = {
                applicationExecutionId: payload.applicationExecutionId,
                applicationWorkflowId: applicationWorkflows[indexOfWorkflow].id,
                status: ApplicationExecutionStatus.DRAFT,
                createdBy: loggedInUserId
            };
            await applicationExecutionWorkflowRepo.saveApplicationExecutionWorkflow(newExecutionWorkflow);
        }
    }
    return { success: true };
};

export const publishApplicationExecutionWorkflow =
    async (applicationId: string, applicationExecutionId: string, applicationExecutionWorkflowId: string) => {
    await validate({
        applicationId,
        applicationExecutionId,
        applicationExecutionWorkflowId }, joiSchema.publishApplicationExecutionWorkflow);
    const savedApp = await applicationRepo.findById(applicationId);
    if (!savedApp) {
        throw boom.badRequest('Invalid application id');
    }
    const savedApplicationExecution = await applicationExecutionRepo.findById(applicationExecutionId);
    if (!savedApplicationExecution) {
        throw boom.badRequest('Invalid application execution id');
    }
    if (!applicationExecutionWorkflowId) {
        throw boom.badRequest('Invalid id');
    }
    const savedExecutionWorkflow = await applicationExecutionWorkflowRepo.findById(applicationExecutionWorkflowId);
    if (!savedExecutionWorkflow) {
        throw boom.badRequest('Invalid id');
    }
    const toSave = savedExecutionWorkflow.get({ plain: true });
    toSave.status = ApplicationExecutionStatus.APPROVED;
    await applicationExecutionWorkflowRepo.saveApplicationExecutionWorkflow(toSave);
    // move workflow to the next
    const applicationWorkflows = await applicationWorkflowRepo.getByApplicationId(applicationId);
    const indexOfWorkflow = applicationWorkflows.findIndex(col => col.id === toSave.applicationWorkflowId);
    if (indexOfWorkflow > -1 && applicationWorkflows.length >= indexOfWorkflow + 1) {
        const payload: IApplicationExecutionWorkflowAttributes = {
            applicationExecutionId,
            applicationWorkflowId: applicationWorkflows[indexOfWorkflow].id,
            status: ApplicationExecutionStatus.DRAFT
        };
        await applicationExecutionWorkflowRepo.saveApplicationExecutionWorkflow(payload);
    }
    return { success: true };
};

export const deleteApplicationExecution = async (id: string, loggedInUserId: string) => {
    const applicationExecution = await applicationExecutionRepo.findById(id);
    if (!applicationExecution) {
        throw boom.badRequest('Invalid application execution id');
    }
    await applicationExecutionRepo.deleteApplicationExecution(id, loggedInUserId);
    return { success: true };
};
