
import * as boom from 'boom';
import * as _ from 'lodash';
import * as moment from 'moment';
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
import * as applicationWorkflowPermissionRepo from '../repositories/application-workflow-permission';
import * as userRepo from '../repositories/user';
import * as departmentRepo from '../repositories/department';
import * as officeLocationRepo from '../repositories/office-location';
import * as groupRepo from '../repositories/group';
import { IApplicationInstance, IApplicationAttributes } from '../models/application';
import { IApplicationExecutionInstance, IApplicationExecutionAttributes } from '../models/application-execution';
import { IApplicationFormFieldInstance } from '../models/application-form-field';
import { Role } from '../enum/role';
import { ApplicationExecutionStatus,
    ApplicationWorkflowType,
    ApplicationWorkflowPermissionType,
    ApplicationWorkflowFieldPermission,
    ApplicationWorkflowAssignTo
} from '../enum/application';
import { IApplicationExecutionWorkflowAttributes } from '../models/application-execution-workflow';
import {
    IExecutionWorkflowCount,
    IGetExecutionSelect, IReassignExecutionRequest, IGetWithdrawRequest
} from '../interface/application';
import { PERMISSION_STATUS_MAPPING } from '../constants/application';

export const getAll = async (loggedInUser: any): Promise<IApplicationExecutionInstance[]> => {
    return applicationExecutionRepo.getAll(loggedInUser.userId, false);
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

export const getDetailedExecutionById = async (executionId: string,
                                               loggedInUser: any,
                                               status: string): Promise<IApplicationExecutionAttributes> => {
    const execution = await applicationExecutionRepo.findById(executionId);
    if (!execution) {
        throw boom.badRequest('Invalid execution id');
    }
    const transformedExecution = await transformExecutionData([execution], loggedInUser, status);
    if (!transformedExecution || !transformedExecution.length) {
        throw boom.badRequest('Not allowed');
    } else {
        return transformedExecution[0];
    }
};

export const getExecutionByLoggedInUserId =
    async (loggedInUser: any, type: string, status?: string): Promise<IApplicationExecutionAttributes[]> => {
    await validate({ loggedInUserId: loggedInUser.userId, type, status }, joiSchema.getExecutionByLoggedInUserId);
    let dbApplicationExecutions: IApplicationExecutionInstance[] = [];
    if (status === ApplicationExecutionStatus.DRAFT) {
        dbApplicationExecutions = await applicationExecutionRepo.getDraftApplicationExecutions(loggedInUser.userId);
    } else {
        dbApplicationExecutions = await applicationExecutionRepo.
            getApplicationExecutionsForApproval(type);
    }
    return transformExecutionData(dbApplicationExecutions, loggedInUser, status);
};

export const getExecutionInProcessLoggedInUserId =
    async (loggedInUser: any, status: string): Promise<IApplicationExecutionAttributes[]> => {
    await validate({ loggedInUserId: loggedInUser.userId, status }, joiSchema.getExecutionInProcessLoggedInUserId);
    const dbApplicationExecutions = await
        applicationExecutionRepo.getApplicationExecutionInProcess(loggedInUser.userId, status);
    return transformExecutionData(dbApplicationExecutions, loggedInUser, status);
};

export const getExecutionInProcessLoggedInUserIdByQuery =
    async (loggedInUser: any, status: string,
           applicationId?: string, type?: string): Promise<IGetExecutionSelect[]> => {
    await validate({ loggedInUserId: loggedInUser.userId, status }, joiSchema.getExecutionInProcessLoggedInUserId);
    let dbApplicationExecutions = [];
    if (!type) {
        if (status === ApplicationExecutionStatus.DRAFT) {
            dbApplicationExecutions = await
                applicationExecutionRepo.getDraftApplicationExecutionQuery(loggedInUser.userId, status, applicationId);
        } else {
            let isClarity = false;
            if (status === ApplicationExecutionStatus.CLARITY) {
                isClarity = true;
            }
            dbApplicationExecutions = await applicationExecutionRepo.
                getApplicationExecutionInProcessQuery({
                    userId: loggedInUser.userId,
                    status,
                    applicationId, isClarity
                });
        }
    } else {
        dbApplicationExecutions = await applicationExecutionRepo.getApplicationExecutionByWorkflowTypeAndStatusQuery(
            status, type, applicationId);
    }
    const response = [];
    for (const ex of dbApplicationExecutions) {
        const shouldContinue = await checkWorkflowPermissionQuery(ex, loggedInUser.userId);
        if (shouldContinue) {
            response.push(ex);
        }
    }
    return response;
};

export const getExecutionParticipatedLoggedInUserId =
    async (loggedInUser: any): Promise<IApplicationExecutionAttributes[]> => {
    await validate({ loggedInUserId: loggedInUser.userId }, joiSchema.getExecutionParticipatedLoggedInUserId);
    // const executionIds = await
    //     applicationExecutionRepo.getApplicationExecutionParticipatedIds(loggedInUser.userId);
    // const ids: string[] = executionIds[0].map((execution: any) => execution.id);
    const dbApplicationExecutions = await
        applicationExecutionRepo.getApprovedApplicationExecutions(loggedInUser.userId);
    return transformExecutionData(dbApplicationExecutions, loggedInUser, undefined);
};

export const getExecutionWithdrawLoggedInUserId =
    async (loggedInUser: any, payload: IGetWithdrawRequest): Promise<IApplicationExecutionAttributes[]> => {
    await validate({ loggedInUserId: loggedInUser.userId }, joiSchema.getExecutionParticipatedLoggedInUserId);
    const isAdmin = loggedInUser.roles.includes(Role.SUPER_ADMIN);
    if (payload.startDate) {
        payload.startDate = moment(payload.startDate + ' 00:00:00').add(-5, 'h').toISOString();
    }
    if (payload.endDate) {
        payload.endDate = moment(payload.endDate + ' 23:59:59').add(-5, 'h').toISOString();
    }
    return applicationExecutionRepo.getApplicationExecutionInProcessQuery({
            userId: loggedInUser.userId,
            status: ApplicationExecutionStatus.WITHDRAW,
            applicationId: payload.applicationId,
            startDate: payload.startDate,
            endDate: payload.endDate,
            isAdmin
    });
};

export const getInProgressExecutions =
    async (loggedInUser: any, applicationId: string): Promise<IGetExecutionSelect[]> => {
    const dbApplicationExecutions = await
        applicationExecutionRepo.getAllExecutionsByStatus(loggedInUser.userId,
            [ApplicationExecutionStatus.DRAFT, ApplicationExecutionStatus.IN_PROGRESS], applicationId);
    return dbApplicationExecutions;
};

export const getExecutionParticipatedLoggedInUserIdQuery =
    async (loggedInUser: any, searchText?: string): Promise<IApplicationExecutionAttributes[]> => {
    await validate({ loggedInUserId: loggedInUser.userId, searchText },
        joiSchema.getExecutionParticipatedLoggedInUserId);
    const dbApplicationExecutions = await
        applicationExecutionRepo.getParticipatedApplicationExecutionQuery(loggedInUser.userId, searchText);
    return dbApplicationExecutions;
};

const transformExecutionData = async (
    dbApplicationExecutions: IApplicationExecutionInstance[],
    user: any,
    status?: string,
) => {
    const applicationExecutions: IApplicationExecutionAttributes[] = [];
    for (const execution of dbApplicationExecutions) {
        const plainExecution = execution.get({ plain: true });
        if (!plainExecution.application) {
            continue;
        }
        if (plainExecution.applicationExecutionWorkflows &&
            plainExecution.applicationExecutionWorkflows.length) {
            // if (onlyDraftEx) {
            //     plainExecution.applicationExecutionWorkflows = plainExecution.applicationExecutionWorkflows.filter(
            //     (ex =>
            //         ex.status === ApplicationExecutionStatus.DRAFT
            //     ));
            // }
            let executionWorkflow: any = plainExecution.applicationExecutionWorkflows[
                plainExecution.applicationExecutionWorkflows.length - 1
            ];
            if (!executionWorkflow || !executionWorkflow.applicationWorkflowId) {
                continue;
            }
            if (status === 'participated') {
                plainExecution.applicationExecutionWorkflows = plainExecution.applicationExecutionWorkflows.filter(
                (ex =>
                    ex.createdBy === user.userId || ex.updatedBy === user.userId
                ));
                executionWorkflow = plainExecution.applicationExecutionWorkflows[0];
            }
            if (executionWorkflow.status !== ApplicationExecutionStatus.APPROVED &&
                executionWorkflow.status !== ApplicationExecutionStatus.REJECT &&
                status !== ApplicationExecutionStatus.WITHDRAW &&
                status !== 'participated') {
                const shouldContinue = await checkWorkflowPermission(plainExecution,
                    executionWorkflow.applicationWorkflowId, user.userId);
                if (shouldContinue) {
                    continue;
                }
            }
        }
        const sections = await applicationSectionRepo.getByApplicationId(execution.applicationId);
        plainExecution.application.applicationFormSections = [];
        const fieldPermissions = await applicationWorkflowFieldPermissionRepo.
            getByApplicationId(execution.applicationId);
        const draftExecution = (plainExecution.applicationExecutionWorkflows &&
            plainExecution.applicationExecutionWorkflows.length) ?
                plainExecution.applicationExecutionWorkflows.find((ex) =>
                ex.status === ApplicationExecutionStatus.DRAFT) : null;
        const latestWorkflowId = draftExecution ? draftExecution.applicationWorkflowId : null;
        let title = plainExecution.application.subject;
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
                    if (plainExecution.applicationExecutionForms && title) {
                        // setting title
                        const formField = plainExecution.applicationExecutionForms
                        .find(f => f.applicationFormFieldId === field.id);
                        title = title.replace(`{${field.fieldId}}`, formField ? formField.value : '');
                        plainExecution.title = title;
                    }
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

const checkWorkflowPermission = async (
    plainExecution: IApplicationExecutionAttributes,
    applicationWorkflowId: string,
    userId: string
) => {
    let shouldContinue: boolean = false;
    const applicationWorkflow = await applicationWorkflowRepo.findById(applicationWorkflowId);
    if (applicationWorkflow) {
        if (!applicationWorkflow.assignTo) {
            if (applicationWorkflow.applicationWorkflowPermissions) {
                const hasPermission = applicationWorkflow.applicationWorkflowPermissions.
                    find(per => per.userId === userId);
                if (!hasPermission) {
                    shouldContinue = false;
                }
            } else {
                shouldContinue = false;
            }
        } else {
            let assignTo = applicationWorkflow.assignTo;
            let fieldId = '';
            if (assignTo.includes('field_')) {
                fieldId = assignTo.replace('field_', '');
                assignTo = ApplicationWorkflowAssignTo.FIELD;
            }
            switch (assignTo) {
                case ApplicationWorkflowAssignTo.INITIATOR:
                    if (plainExecution.createdBy !== userId) {
                        shouldContinue = true;
                    }
                    break;
                case ApplicationWorkflowAssignTo.MANAGER:
                    if (plainExecution.createdByUser &&
                        plainExecution.createdByUser.managerId !== userId) {
                            shouldContinue = true;
                    }
                    break;
                case ApplicationWorkflowAssignTo.DEPARTMENT_HEAD:
                    if (plainExecution.createdByUser &&
                        plainExecution.createdByUser.departmentId) {
                        const department = await departmentRepo.
                            findById(plainExecution.createdByUser.departmentId);
                        if (department &&
                            department.userId !== userId) {
                                shouldContinue = true;
                        }
                    }
                    break;
                case ApplicationWorkflowAssignTo.LOCATION_HEAD:
                    if (plainExecution.createdByUser &&
                        plainExecution.createdByUser.officeLocationId) {
                        const officeLocation = await officeLocationRepo.
                            findById(plainExecution.createdByUser.officeLocationId);
                        if (officeLocation &&
                            officeLocation.userId !== userId) {
                                shouldContinue = true;
                        }
                    }
                    break;
                case ApplicationWorkflowAssignTo.GROUP:
                    if (!applicationWorkflow.groupId) {
                        shouldContinue = true;
                    } else {
                        const userGroups = await groupRepo.findUserGroupByGroupId(applicationWorkflow.groupId);
                        const hasUser = userGroups.find(userGroup => userGroup.userId === userId);
                        if (!hasUser) {
                            shouldContinue = true;
                        }
                    }
                    break;
                case ApplicationWorkflowAssignTo.FIELD:
                    if (plainExecution.applicationExecutionForms) {
                        const field = plainExecution.applicationExecutionForms.find(field => field.fieldId === fieldId);
                        if (field && field.value !== userId) {
                            shouldContinue = true;
                        }
                    }
                    break;
            }
        }
    }
    return shouldContinue;
};

const checkWorkflowPermissionQuery = async (execution: IGetExecutionSelect, userId: string) => {
    let shouldContinue: boolean = true;
    const applicationWorkflow = await applicationWorkflowRepo.findById(execution.applicationWorkflowId);
    if (applicationWorkflow) {
        if (!applicationWorkflow.assignTo) {
            if (applicationWorkflow.applicationWorkflowPermissions) {
                const hasPermission = applicationWorkflow.applicationWorkflowPermissions.
                    find(per => per.userId === userId);
                if (!hasPermission) {
                    shouldContinue = false;
                }
            } else {
                shouldContinue = false;
            }
        } else {
            let assignTo = applicationWorkflow.assignTo;
            let fieldId = '';
            if (assignTo.includes('field_')) {
                fieldId = assignTo.replace('field_', '');
                assignTo = ApplicationWorkflowAssignTo.FIELD;
            }
            switch (assignTo) {
                case ApplicationWorkflowAssignTo.INITIATOR:
                    if (execution.createdBy !== userId) {
                        shouldContinue = false;
                    }
                    break;
                case ApplicationWorkflowAssignTo.MANAGER:
                    if (execution.managerId !== userId) {
                            shouldContinue = false;
                    }
                    break;
                case ApplicationWorkflowAssignTo.DEPARTMENT_HEAD:
                    if (execution.departmentId) {
                        const department = await departmentRepo.
                            findById(execution.departmentId);
                        if (department &&
                            department.userId !== userId) {
                                shouldContinue = false;
                        }
                    }
                    break;
                case ApplicationWorkflowAssignTo.LOCATION_HEAD:
                    if (execution.officeLocationId) {
                        const officeLocation = await officeLocationRepo.
                            findById(execution.officeLocationId);
                        if (officeLocation &&
                            officeLocation.userId !== userId) {
                                shouldContinue = false;
                        }
                    }
                    break;
                case ApplicationWorkflowAssignTo.FIELD:
                    const field = await applicationExecutionFormRepo.
                        getByApplicationExecutionIdAndFieldId(execution.id, fieldId);
                    if (!field || (field && field.value !== userId)) {
                        shouldContinue = false;
                    }
                    break;
                default:
                    shouldContinue = false;
            }
        }
    }
    return shouldContinue;
};

export const getExecutionWorkflowsCount =
    async (loggedInUserId: string): Promise<IExecutionWorkflowCount> => {
    let resp: IExecutionWorkflowCount = {
        approval: 0,
        inputRequest: 0,
        clarification: 0,
        draft: 0,
        approved: 0,
        reject: 0,
        participated: 0
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
        applicationExecutionRepo.getDraftApplicationExecutionsCount(loggedInUserId),
        applicationExecutionRepo.getApplicationExecutionParticipatedIds(loggedInUserId)
    ]);
    const participatedIds: string[] = response[6][0].map((execution: any) => execution.id);
    resp = {
        approval: response[3],
        inputRequest: response[4],
        clarification: response[2],
        draft: response[5],
        approved: response[0],
        reject: response[1],
        participated: participatedIds.length
    };
    return resp;
};

export const getExecutionParticipatedUsers =
    async (loggedInUser: any, executionId: string): Promise<IApplicationExecutionAttributes[]> => {
    await validate({ loggedInUserId: loggedInUser.userId, executionId },
        joiSchema.getExecutionParticipatedUsers);
    const users = await applicationExecutionRepo.getParticipatedUsersByExecutionId(executionId);
    let userIds = users.map((user) => user.createdBy);
    userIds = users.filter((user) => user.updatedBy).map((user) => user.updatedBy);
    const dbUsers = await userRepo.findByIds(userIds);
    return dbUsers;
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
    let formFieldIds = applicationExecution.applicationExecutionForms ?
        applicationExecution.applicationExecutionForms.map(ex => ex.applicationFormFieldId) : [];
    formFieldIds = _.reject(formFieldIds, helper.rejectUndefinedOrNull);
    const savedApplicationFormFields = await applicationFormFieldRepo.findByIds(formFieldIds);
    if (savedApplicationFormFields.length !== _.uniq(formFieldIds).length) {
        throw boom.badRequest('Invalid application form field id');
    }
    // validation for required in form fields
    applicationExecution.applicationId = applicationId;
    const execution = await applicationExecutionRepo.saveApplicationExecution(applicationExecution);
    applicationExecution.id = execution.id;
    if (!applicationExecution.applicationExecutionForms) {
        return getByApplicationId(applicationId);
    }
    const title = savedApp.subject;
    for (const field of applicationExecution.applicationExecutionForms) {
        field.applicationExecutionId = execution.id;
        // setting title = logic has been moved when getting execution
        // const formField = savedApplicationFormFields.find(f => f.id === field.applicationFormFieldId);
        // title = title.replace(`{${formField ? formField.fieldId : ''}}`, field.value);
        await applicationExecutionFormRepo.saveApplicationExecutionForm(field);
    }
    applicationExecution.title = title;
    await applicationExecutionRepo.saveApplicationExecution(applicationExecution);
    return execution;
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
        status: ApplicationExecutionStatus.IN_PROGRESS,
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
    if (payload.clarificationDetails && payload.clarificationDetails.userId) {
        const clarificationUser = await userRepo.findById(payload.clarificationDetails.userId);
        if (!clarificationUser) {
            throw boom.badRequest('Invalid clarification user');
        }
        payload.clarificationUserId = payload.clarificationDetails.userId;
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
        } else {
            // if no workflow found, mark execution as approved
            const toSaveExecution = savedApplicationExecution.get({ plain: true });
            await applicationExecutionRepo.saveApplicationExecution({
                ...toSaveExecution,
                status: ApplicationExecutionStatus.APPROVED,
                updatedBy: loggedInUserId
            });
        }
    } else {
        // mark execution as rejected or clarity
        const toSaveExecution = savedApplicationExecution.get({ plain: true });
        await applicationExecutionRepo.saveApplicationExecution({
            ...toSaveExecution,
            status: payload.status === ApplicationExecutionStatus.DRAFT ?
                ApplicationExecutionStatus.IN_PROGRESS : payload.status,
            updatedBy: loggedInUserId
        });
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
    } else {
        // if no workflow found, mark execution as approved
        await applicationExecutionRepo.saveApplicationExecution({
            id: applicationExecutionId,
            status: ApplicationExecutionStatus.APPROVED
        });
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

export const reassignWorkflow = async (payload: IReassignExecutionRequest) => {
    await validate(payload, joiSchema.reassignWorkflow);
    const applicationExecution = await applicationExecutionRepo.findById(payload.executionId);
    if (!applicationExecution) {
        throw boom.badRequest('Invalid application execution id');
    }
    const user = await userRepo.findById(payload.userId);
    if (!user) {
        throw boom.badRequest('Invalid user id');
    }
    const workflow = await applicationWorkflowRepo.findById(payload.workflowId);
    if (!workflow) {
        throw boom.badRequest('Invalid application workflow id');
    }
    if (workflow.assignTo) {
        const toSaveWorkflow = workflow.get({ plain: true });
        toSaveWorkflow.assignTo = null;
        await applicationWorkflowRepo.saveApplicationWorkflow(toSaveWorkflow);
    }
    const newPermission = {
        applicationWorkflowId: workflow.id,
        userId: payload.userId
    };
    await applicationWorkflowPermissionRepo.saveApplicationWorkflowPermission(newPermission);
    return { success: true };
};

export const withdraw = async (loggedInUserId: string, executionId: string, executionWorkflowId: string) => {
    await validate({ loggedInUserId, executionId }, joiSchema.withdraw);
    const applicationExecution = await applicationExecutionRepo.findByIdForValidation(executionId);
    if (!applicationExecution) {
        throw boom.badRequest('Invalid application execution id');
    }
    if (applicationExecution.createdBy !== loggedInUserId) {
        throw boom.unauthorized('You are not authorize to withdraw this execution');
    }
    const executionWorkflow = await applicationExecutionWorkflowRepo.findById(executionWorkflowId);
    if (!executionWorkflow) {
        throw boom.badRequest('Invalid application execution id');
    }
    if (executionWorkflow.applicationWorkflow && !executionWorkflow.applicationWorkflow.canWithdraw) {
        throw boom.badRequest('Withdraw is not allowed for this workflow');
    }
    const toSaveExecutionWorkflow = {
        ...executionWorkflow.get({plain: true}),
        id: executionWorkflowId,
        status: ApplicationExecutionStatus.WITHDRAW,
    };
    await applicationExecutionWorkflowRepo.saveApplicationExecutionWorkflow(toSaveExecutionWorkflow);
    const execution = {
        ...applicationExecution.get({plain: true}),
        id: executionId,
        status: ApplicationExecutionStatus.WITHDRAW,
    };
    await applicationExecutionRepo.saveApplicationExecution(execution);
    return { success: true };
};
