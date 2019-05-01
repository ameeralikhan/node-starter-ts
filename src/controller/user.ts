import { Context } from 'koa';
import * as userService from '../services/user';
import { IUserRequest } from '../interface/user';

export const getAll = async (ctx: Context, next: () => void) => {
    ctx.state.data = await userService.getAll();
    await next();
};

export const getUser = async (ctx: Context, next: () => void) => {
    const userId: string = ctx.state.user.userId;
    ctx.state.data = await userService.findById(userId);
    await next();
};

export const getUserById = async (ctx: Context, next: () => void) => {
    const userId: string = ctx.params.userId;
    ctx.state.data = await userService.findById(userId);
    await next();
};

export const saveUser = async (ctx: Context, next: () => void) => {
    const user: IUserRequest = ctx.request.body;
    ctx.state.data = await userService.saveUser(user);
    await next();
};
