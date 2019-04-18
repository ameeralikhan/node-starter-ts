import { Context } from 'koa';
import * as userService from '../services/user';
import { IUserRequest } from '../interface/user';

export const getUser = async (ctx: Context, next: () => void) => {
    const userId: string = ctx.state.user.userId;
    ctx.state.data = await userService.findById(userId);
    await next();
};

export const saveUser = async (ctx: Context, next: () => void) => {
    const userId: string = ctx.state.user.userId;
    const user: IUserRequest = ctx.request.body;
    ctx.state.data = await userService.saveUser(userId, user);
    await next();
};
