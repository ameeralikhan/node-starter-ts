import * as boom from 'boom';
import * as jwt from 'jsonwebtoken';
import { Context } from 'koa';
import * as config from '../config';
import * as userRepo from '../repositories/user';

const authentication = async (ctx: Context, next: () => void) => {
  const token = ctx.header.authorization;
  if (!token) {
      throw boom.unauthorized();
  } else {
      try {
        const decoded: any = jwt.verify(token, config.default.tokenSecret);
        const savedUser = await userRepo.findById(decoded.id);
        let dbUser = {};
        if (savedUser) {
          dbUser = savedUser.get({ plain: true });
        }
        ctx.state.user = {
          userId: decoded.id,
          roles: decoded.roles,
          ...dbUser
        };
      } catch (e) {
        throw boom.unauthorized();
      }
  }
  await next();
};

export default authentication;
