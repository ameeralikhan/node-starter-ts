import { Context } from 'koa';
import * as fileService from '../services/file';

export const saveProfilePicture = async (ctx: Context, next: () => void) => {
  const file = ctx.request.files && ctx.request.files.file;
  const userId = ctx.state.user.userId;
  ctx.state.data = await fileService.uploadProfilePicture(userId, file);
  await next();
};
