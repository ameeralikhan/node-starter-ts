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
import * as applicationSectionRepo from '../repositories/application-form-section';
import * as applicationWorkflowFieldPermissionRepo from '../repositories/application-workflow-field-permission';
import * as userRepo from '../repositories/user';
import { IApplicationInstance, IApplicationAttributes } from '../models/application';
import { IApplicationExecutionInstance, IApplicationExecutionAttributes } from '../models/application-execution';
import { IApplicationFormFieldInstance } from '../models/application-form-field';
import { Role } from '../enum/role';
import { ApplicationExecutionStatus,
    ApplicationWorkflowType,
    ApplicationWorkflowPermissionType,
    ApplicationWorkflowFieldPermission
} from '../enum/application';
import { IApplicationExecutionWorkflowAttributes } from '../models/application-execution-workflow';
import { IExecutionWorkflowCount } from '../interface/application';
import { PERMISSION_STATUS_MAPPING } from '../constants/application';

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
    async (loggedInUserId: string, type: string, status?: string): Promise<IApplicationExecutionAttributes[]> => {
    await validate({ loggedInUserId, type, status }, joiSchema.getExecutionByLoggedInUserId);
    let dbApplicationExecutions: IApplicationExecutionInstance[] = [];
    if (status === ApplicationExecutionStatus.DRAFT) {
        dbApplicationExecutions = await applicationExecutionRepo.getDraftApplicationExecutions(loggedInUserId);
    } else {
        dbApplicationExecutions = await applicationExecutionRepo.
            getApplicationExecutionsForApproval(loggedInUserId, type);
    }
    return transformExecutionData(dbApplicationExecutions, status);
};

export const getExecutionInProcessLoggedInUserId =
    async (loggedInUserId: string, status: string): Promise<IApplicationExecutionAttributes[]> => {
    await validate({ loggedInUserId, status }, joiSchema.getExecutionInProcessLoggedInUserId);
    const dbApplicationExecutions = await
        applicationExecutionRepo.getApplicationExecutionInProcess(loggedInUserId, status);
    return transformExecutionData(dbApplicationExecutions, status);
};

const transformExecutionData = async (dbApplicationExecutions: IApplicationExecutionInstance[], status?: string) => {
    const applicationExecutions: IApplicationExecutionAttributes[] = [];
    for (const execution of dbApplicationExecutions) {
        const plainExecution = execution.get({ plain: true });
        if (!plainExecution.application) {
            continue;
        }
        const sections = await applicationSectionRepo.getByApplicationId(execution.applicationId);
        plainExecution.application.applicationFormSections = [];
        const fieldPermissions = await applicationWorkflowFieldPermissionRepo.
            getByApplicationId(execution.applicationId);
        const latestWorkflowId = plainExecution.applicationExecutionWorkflows &&
            plainExecution.applicationExecutionWorkflows.length ?
             plainExecution.applicationExecutionWorkflows[0].applicationWorkflowId : null;
        for (const sectionInstance of sections) {
            const section = sectionInstance.get({ plain: true });
            const type = status ? PERMISSION_STATUS_MAPPING[status]
             || ApplicationWorkflowPermissionType.WORKFLOW : ApplicationWorkflowPermissionType.WORKFLOW;
            const applicationWorkflowId = type !== ApplicationWorkflowPermissionType.WORKFLOW
                ? null : latestWorkflowId;
            if (!fieldPermissions || !fieldPermissions.length) {
                continue;
            }
            const workflowPermission = fieldPermissions.find(
                per => per.type === type && per.applicationFormSectionId === section.id &&
                    per.applicationWorkflowId === applicationWorkflowId
            );
            if (workflowPermission && workflowPermission.permission === ApplicationWorkflowFieldPermission.HIDDEN) {
                continue;
            }
            if (section.applicationFormFields && section.applicationFormFields.length) {
                section.applicationFormFields = section.applicationFormFields.filter((field) => {
                    if (!plainExecution ||
                        !plainExecution.application ||
                        !fieldPermissions) {
                        return true;
                    }
                    const workflowPermission = fieldPermissions.find(
                        per => per.type === type && per.applicationFormFieldId === field.id &&
                            per.applicationWorkflowId === applicationWorkflowId
                    );
                    if (workflowPermission &&
                        workflowPermission.permission === ApplicationWorkflowFieldPermission.HIDDEN) {
                        return false;
                    }
                    field.permission = workflowPermission ? workflowPermission.permission : undefined;
                    return true;
                });
            }
            plainExecution.application.applicationFormSections.push(section);
        }
        applicationExecutions.push(plainExecution);
    }
    return applicationExecutions;
};

export const getExecutionWorkflowsCount =
    async (loggedInUserId: string): Promise<IExecutionWorkflowCount> => {
    let resp: IExecutionWorkflowCount = {
        approval: 0,
        inputRequest: 0,
        clarification: 0,
        draft: 0,
        approved: 0,
        reject: 0
    };
    const response = await Promise.all([
        applicationExecutionRepo.getApplicationExecutionInProcessCount(loggedInUserId,
            ApplicationExecutionStatus.APPROVED),
        applicationExecutionRepo.getApplicationExecutionInProcessCount(loggedInUserId,
            ApplicationExecutionStatus.REJECT),
        applicationExecutionRepo.getApplicationExecutionInProcessCount(loggedInUserId,
                ApplicationExecutionStatus.CLARITY),
        applicationExecutionRepo.getApplicationExecutionsForApprovalCount(loggedInUserId,
            ApplicationWorkflowType.APPROVAL),
        applicationExecutionRepo.getApplicationExecutionsForApprovalCount(loggedInUserId,
            ApplicationWorkflowType.INPUT),
        applicationExecutionRepo.getDraftApplicationExecutionsCount(loggedInUserId)
    ]);
    resp = {
        approval: response[3],
        inputRequest: response[4],
        clarification: response[2],
        draft: response[5],
        approved: response[0],
        reject: response[1]
    };
    return resp;
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

export const saveApplicationExecutionForm = async (applicationId: string,
                                                   loggedInUserId: string,
                                                   applicationExecution: IApplicationExecutionAttributes) => {
    await validate(applicationExecution, joiSchema.saveApplicationExecutionForm);
    const savedApp = await applicationRepo.findById(applicationId);
    if (!savedApp) {
        throw boom.badRequest('Invalid application id');
    }
    if (applicationExecution.id) {
        const savedApplicationExecution = await applicationExecutionRepo.findById(applicationExecution.id);
        if (!savedApplicationExecution) {
            throw boom.badRequest('Invalid application execution id');
        }
        applicationExecution.updatedBy = loggedInUserId;
        applicationExecution.startedAt = savedApplicationExecution.startedAt;
        applicationExecution.status = savedApplicationExecution.status;
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
    } else if (payload.status === ApplicationExecutionStatus.CLARITY) {
        payload.comments = payload.comments || [];
        payload.comments.unshift({
            userId: user.id,
            time: new Date(),
            comment: payload.clarificationDetails.comment,
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
        if (indexOfWorkflow > -1 && applicationWorkflows.length >= indexOfWorkflow + 2) {
            const newExecutionWorkflow: IApplicationExecutionWorkflowAttributes = {
                applicationExecutionId: payload.applicationExecutionId,
                applicationWorkflowId: applicationWorkflows[indexOfWorkflow + 1].id,
                comments: toSave.comments,
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
