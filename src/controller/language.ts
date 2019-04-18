import { Context } from 'koa';
import * as languageService from '../services/language';

export const findAll = async (ctx: Context, next: () => void) => {
  ctx.state.data = await languageService.findAll();
  await next();
};
