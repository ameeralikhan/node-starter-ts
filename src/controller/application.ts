import { Context } from 'koa';
import * as applicationService from '../services/application';
import * as applicationFormService from '../services/application-form';
import * as applicationWorkflowService from '../services/application-workflow';
import * as applicationWorkflowFieldPermissionService from '../services/application-workflow-field-permission';
import * as applicationExecutionService from '../services/application-execution';

export const getCurrentLoggedInUserApplications = async (ctx: Context, next: () => void) => {
  const userId: string = ctx.state.user.userId;
  ctx.state.data = await applicationService.getCurrentLoggedInUserApplications(userId);
  await next();
};

export const getApplicationById = async (ctx: Context, next: () => void) => {
  const applicationId: string = ctx.params.applicationId;
  ctx.state.data = await applicationService.getById(applicationId);
  await next();
};

export const getApplicationFormSectionById = async (ctx: Context, next: () => void) => {
  const applicationId: string = ctx.params.applicationId;
  const sectionId: string = ctx.params.sectionId;
  ctx.state.data = await applicationFormService.getApplicationSectionById(applicationId, sectionId);
  await next();
};

export const getApplicationFormFieldById = async (ctx: Context, next: () => void) => {
  const applicationId: string = ctx.params.applicationId;
  const fieldId: string = ctx.params.fieldId;
  ctx.state.data = await applicationFormService.getApplicationFormFieldById(applicationId, fieldId);
  await next();
};

export const getApplicationForm = async (ctx: Context, next: () => void) => {
  const applicationId: string = ctx.params.applicationId;
  const forExecution: boolean = ctx.query.forExecution === 'true' ? true : false;
  ctx.state.data = await applicationFormService.getByApplicationId(applicationId, forExecution);
  await next();
};

export const getApplicationWorkflow = async (ctx: Context, next: () => void) => {
  const applicationId: string = ctx.params.applicationId;
  ctx.state.data = await applicationWorkflowService.getByApplicationId(applicationId);
  await next();
};

export const getApplicationWorkflowFieldPermission = async (ctx: Context, next: () => void) => {
  const applicationId: string = ctx.params.applicationId;
  ctx.state.data = await applicationWorkflowFieldPermissionService.getByApplicationId(applicationId);
  await next();
};

export const getApplicationExecution = async (ctx: Context, next: () => void) => {
  const applicationId: string = ctx.params.applicationId;
  ctx.state.data = await applicationExecutionService.getByApplicationId(applicationId);
  await next();
};

export const getExecutionById = async (ctx: Context, next: () => void) => {
  const executionId: string = ctx.params.executionId;
  ctx.state.data = await applicationExecutionService.getById(executionId);
  await next();
};

export const getDetailExecutionById = async (ctx: Context, next: () => void) => {
  const executionId: string = ctx.params.executionId;
  const user: any = ctx.state.user;
  const status: string = ctx.request.query.status === 'undefined' ? undefined : ctx.request.query.status;
  ctx.state.data = await applicationExecutionService.getDetailedExecutionById(executionId, user, status);
  await next();
};

export const getAllExecution = async (ctx: Context, next: () => void) => {
  const user: any = ctx.state.user;
  ctx.state.data = await applicationExecutionService.getAll(user);
  await next();
};

export const getExecutionByLoggedInUserId = async (ctx: Context, next: () => void) => {
  const status: string = ctx.request.query.status === 'undefined' ? undefined : ctx.request.query.status;
  const type: string = ctx.request.query.type;
  const user: any = ctx.state.user;
  ctx.state.data = await applicationExecutionService.getExecutionByLoggedInUserId(user, type, status);
  await next();
};

export const getExecutionInProcessLoggedInUserId = async (ctx: Context, next: () => void) => {
  const status: string = ctx.request.query.status;
  const user: any = ctx.state.user;
  ctx.state.data = await applicationExecutionService.getExecutionInProcessLoggedInUserId(user, status);
  await next();
};

export const getExecutionInProcessLoggedInUserIdByQuery = async (ctx: Context, next: () => void) => {
  const status: string = ctx.request.query.status;
  const type: string = ctx.request.query.type;
  const user: any = ctx.state.user;
  const applicationId: string = ctx.request.query.applicationId;
  ctx.state.data = await applicationExecutionService.
    getExecutionInProcessLoggedInUserIdByQuery(user, status, applicationId, type);
  await next();
};

export const getExecutionParticipatedLoggedInUserId = async (ctx: Context, next: () => void) => {
  const user: any = ctx.state.user;
  ctx.state.data = await applicationExecutionService.getExecutionParticipatedLoggedInUserId(user);
  await next();
};

export const getExecutionParticipatedQuery = async (ctx: Context, next: () => void) => {
  const user: any = ctx.state.user;
  ctx.state.data = await applicationExecutionService.getExecutionParticipatedLoggedInUserIdQuery(user);
  await next();
};

export const getInProgressExecutions = async (ctx: Context, next: () => void) => {
  const user: any = ctx.state.user;
  const applicationId: string = ctx.params.applicationId;
  ctx.state.data = await applicationExecutionService.getInProgressExecutions(user, applicationId);
  await next();
};

export const getExecutionWorkflowsCount = async (ctx: Context, next: () => void) => {
  const userId: string = ctx.state.user.userId;
  ctx.state.data = await applicationExecutionService.getExecutionWorkflowsCount(userId);
  await next();
};

export const getApplicationFieldTitles = async (ctx: Context, next: () => void) => {
  const applicationId: string = ctx.params.applicationId;
  ctx.state.data = await applicationFormService.getApplicationFieldTitles(applicationId);
  await next();
};

export const saveApplication = async (ctx: Context, next: () => void) => {
  const userId: string = ctx.state.user.userId;
  const payload = ctx.request.body;
  ctx.state.data = await applicationService.saveApplication(userId, payload);
  await next();
};

export const publishApplication = async (ctx: Context, next: () => void) => {
  const id: string = ctx.params.applicationId;
  const userId: string = ctx.state.user.userId;
  const editableUserIds: string = ctx.request.body.editableUserIds;
  const canAllEdits: boolean = ctx.request.body.canAllEdits;
  const subject: string = ctx.request.body.subject;
  ctx.state.data = await applicationService.publishApplication(id, editableUserIds, canAllEdits, subject);
  await next();
};

export const saveApplicationForm = async (ctx: Context, next: () => void) => {
  const applicationId: string = ctx.params.applicationId;
  const payload = ctx.request.body;
  ctx.state.data = await applicationFormService.saveApplicationForm(applicationId, payload);
  await next();
};

export const saveApplicationWorkflow = async (ctx: Context, next: () => void) => {
  const applicationId: string = ctx.params.applicationId;
  const userId: string = ctx.state.user.userId;
  const payload = ctx.request.body;
  ctx.state.data = await applicationWorkflowService.saveApplicationWorkflow(applicationId, userId, payload);
  await next();
};

export const saveApplicationWorkflowFieldPermission = async (ctx: Context, next: () => void) => {
  const applicationId: string = ctx.params.applicationId;
  const payload = ctx.request.body;
  ctx.state.data =
    await applicationWorkflowFieldPermissionService.saveApplicationWorkflowFieldPermission(applicationId, payload);
  await next();
};

export const saveApplicationExecution = async (ctx: Context, next: () => void) => {
  const applicationId: string = ctx.params.applicationId;
  const userId: string = ctx.state.user.userId;
  const payload = ctx.request.body;
  ctx.state.data = await applicationExecutionService.saveApplicationExecution(applicationId, userId, payload);
  await next();
};

export const saveApplicationExecutionForm = async (ctx: Context, next: () => void) => {
  const applicationId: string = ctx.params.applicationId;
  const userId: string = ctx.state.user.userId;
  const payload = ctx.request.body;
  ctx.state.data = await applicationExecutionService.saveApplicationExecutionForm(applicationId, userId, payload);
  await next();
};

export const publishApplicationExecution = async (ctx: Context, next: () => void) => {
  const userId: string = ctx.state.user.userId;
  const applicationId: string = ctx.params.applicationId;
  const applicationExecutionId: string = ctx.params.applicationExecutionId;
  ctx.state.data = await applicationExecutionService.publishApplicationExecution(applicationId,
    userId, applicationExecutionId);
  await next();
};

export const saveApplicationExecutionWorkflow = async (ctx: Context, next: () => void) => {
  const applicationId: string = ctx.params.applicationId;
  const userId: string = ctx.state.user.userId;
  const payload = {
    id: ctx.params.applicationExecutionWorkflowId,
    applicationExecutionId: ctx.params.applicationExecutionId,
    comments: ctx.request.body.comments,
    status: ctx.request.body.status,
    rejectionDetails: ctx.request.body.rejectionDetails,
    clarificationDetails: ctx.request.body.clarificationDetails
  };
  ctx.state.data = await applicationExecutionService.saveApplicationExecutionWorkflow(applicationId, userId, payload);
  await next();
};

// not in use
export const publishApplicationExecutionWorkflow = async (ctx: Context, next: () => void) => {
  const applicationId: string = ctx.params.applicationId;
  const applicationExecutionId = ctx.params.applicationExecutionId;
  const executionWorkflowId = ctx.params.applicationExecutionWorkflowId;
  ctx.state.data = await applicationExecutionService.publishApplicationExecutionWorkflow(
      applicationId, applicationExecutionId, executionWorkflowId);
  await next();
};

export const deleteApplication = async (ctx: Context, next: () => void) => {
  const id: string = ctx.params.id;
  const userId: string = ctx.state.user.userId;
  ctx.state.data = await applicationService.deleteApplication(id, userId);
  await next();
};

export const deleteApplicationExecution = async (ctx: Context, next: () => void) => {
  const executionId: string = ctx.params.executionId;
  const userId: string = ctx.state.user.userId;
  ctx.state.data = await applicationExecutionService.deleteApplicationExecution(executionId, userId);
  await next();
};
