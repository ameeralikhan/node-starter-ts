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
  ctx.state.data = await applicationFormService.getByApplicationId(applicationId);
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

export const getAllExecution = async (ctx: Context, next: () => void) => {
  ctx.state.data = await applicationExecutionService.getAll();
  await next();
};

export const getExecutionByLoggedInUserId = async (ctx: Context, next: () => void) => {
  const status: string = ctx.request.query.status === 'undefined' ? undefined : ctx.request.query.status;
  const type: string = ctx.request.query.type;
  const userId: string = ctx.state.user.userId;
  ctx.state.data = await applicationExecutionService.getExecutionByLoggedInUserId(userId, type, status);
  await next();
};

export const getExecutionByLoggedInUserIdCount = async (ctx: Context, next: () => void) => {
  const status: string = ctx.request.query.status === 'undefined' ? undefined : ctx.request.query.status;
  const type: string = ctx.request.query.type;
  const userId: string = ctx.state.user.userId;
  ctx.state.data = await applicationExecutionService.getExecutionByLoggedInUserIdCount(userId, type, status);
  await next();
};

export const getExecutionInProcessLoggedInUserId = async (ctx: Context, next: () => void) => {
  const status: string = ctx.request.query.status;
  const userId: string = ctx.state.user.userId;
  ctx.state.data = await applicationExecutionService.getExecutionInProcessLoggedInUserId(userId, status);
  await next();
};

export const getExecutionInProcessLoggedInUserIdCount = async (ctx: Context, next: () => void) => {
  const status: string = ctx.request.query.status;
  const userId: string = ctx.state.user.userId;
  ctx.state.data = await applicationExecutionService.getExecutionInProcessLoggedInUserIdCount(userId, status);
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
  ctx.state.data = await applicationService.publishApplication(id, editableUserIds, canAllEdits);
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
