import { Context } from 'koa';
import * as departmentService from '../services/department';

export const getAll = async (ctx: Context, next: () => void) => {
  ctx.state.data = await departmentService.getAll();
  await next();
};
