import * as boom from 'boom';
import * as jwt from 'jsonwebtoken';
import { Context } from 'koa';
import * as config from '../config';

const authentication = async (ctx: Context, next: () => void) => {
  const token = ctx.header.authorization;
  if (!token) {
      throw boom.unauthorized();
  } else {
      try {
        const decoded: any = jwt.verify(token, config.default.tokenSecret);
        ctx.state.user = {
          userId: decoded.id,
          email: decoded.email,
          roles: decoded.roles
        };
      } catch (e) {
        throw boom.unauthorized();
      }
  }
  await next();
};

export default authentication;
