import { Context } from 'koa';
import * as roleService from '../services/role';

export const getAll = async (ctx: Context, next: () => void) => {
  ctx.state.data = await roleService.getAll();
  await next();
};
