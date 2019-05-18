import { Context } from 'koa';
import * as applicationService from '../services/application';
import * as applicationFormService from '../services/application-form';

export const getCurrentLoggedInUserApplications = async (ctx: Context, next: () => void) => {
  const userId: string = ctx.state.user.userId;
  ctx.state.data = await applicationService.getCurrentLoggedInUserApplications(userId);
  await next();
};

export const getApplicationForm = async (ctx: Context, next: () => void) => {
  const applicationId: string = ctx.params.applicationId;
  ctx.state.data = await applicationFormService.getByApplicationId(applicationId);
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

export const deleteApplication = async (ctx: Context, next: () => void) => {
  const id: string = ctx.params.id;
  const userId: string = ctx.state.user.userId;
  ctx.state.data = await applicationService.deleteApplication(id, userId);
  await next();
};
