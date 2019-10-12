import { Context } from 'koa';
import * as reportService from '../services/report';

export const getMyItemReport = async (ctx: Context, next: () => void) => {
  const user: string = ctx.state.user;
  ctx.state.data = await reportService.getMyItemReport(user);
  await next();
};

export const getUserWorkloadReport = async (ctx: Context, next: () => void) => {
  const userId: string = ctx.params.userId;
  ctx.state.data = await reportService.getUserWorkloadReport(userId);
  await next();
};
