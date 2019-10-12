import { Context } from 'koa';
import * as reportService from '../services/report';

export const getMyItemReport = async (ctx: Context, next: () => void) => {
  const user: string = ctx.state.user;
  ctx.state.data = await reportService.getMyItemReport(user);
  await next();
};
