import { Context } from 'koa';
import * as applicationService from '../services/application';
import * as applicationFormService from '../services/application-form';
import * as applicationWorkflowService from '../services/application-workflow';
import * as applicationWorkflowFieldPermissionService from '../services/application-workflow-field-permission';

export const getCurrentLoggedInUserApplications = async (ctx: Context, next: () => void) => {
  const userId: string = ctx.state.user.userId;
  ctx.state.data = await applicationService.getCurrentLoggedInUserApplications(userId);
  await next();
};

export const getApplicationById = async (ctx: Context, next: () => void) => {
  const applicationId: string = ctx.params.id;
  ctx.state.data = await applicationService.getById(applicationId);
  await next();
};

export const getApplicationFormSectionById = async (ctx: Context, next: () => void) => {
  const applicationId: string = ctx.params.id;
  const sectionId: string = ctx.params.sectionId;
  ctx.state.data = await applicationFormService.getApplicationSectionById(applicationId, sectionId);
  await next();
};

export const getApplicationFormFieldById = async (ctx: Context, next: () => void) => {
  const applicationId: string = ctx.params.id;
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

export const saveApplication = async (ctx: Context, next: () => void) => {
  const userId: string = ctx.state.user.userId;
  const payload = ctx.request.body;
  ctx.state.data = await applicationService.saveApplication(userId, payload);
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
  const payload = ctx.request.body;
  ctx.state.data = await applicationWorkflowService.saveApplicationWorkflow(applicationId, payload);
  await next();
};

export const saveApplicationWorkflowFieldPermission = async (ctx: Context, next: () => void) => {
  const applicationId: string = ctx.params.applicationId;
  const payload = ctx.request.body;
  ctx.state.data =
    await applicationWorkflowFieldPermissionService.saveApplicationWorkflowFieldPermission(applicationId, payload);
  await next();
};

export const deleteApplication = async (ctx: Context, next: () => void) => {
  const id: string = ctx.params.id;
  const userId: string = ctx.state.user.userId;
  ctx.state.data = await applicationService.deleteApplication(id, userId);
  await next();
};
