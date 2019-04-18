import { Context } from 'koa';
import * as notificationService from '../services/notification';

export const findByUserId = async (ctx: Context, next: () => void) => {
  const userId: string = ctx.state.user.userId;
  const role: string = ctx.state.user.role;
  ctx.state.data = await notificationService.findByUserId(userId, role);
  await next();
};

export const markNotificationAsRead = async (ctx: Context, next: () => void) => {
  const userId: string = ctx.state.user.userId;
  ctx.state.data = await notificationService.markNotificationIsRead(userId);
  await next();
};
