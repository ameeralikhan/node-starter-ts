import { Context } from 'koa';
import { forbidden } from 'boom';
import * as _ from 'lodash';

import config from '../config/index';

const authorization = (isPublic: boolean = true, allowedRoles: string[] = []) => {
  return async (ctx: Context, next: () => void) => {
    if (isPublic) {
      const accessKey = ctx.header['access-key'];
      if (!accessKey || accessKey !== config.apiAccessKeys.app) {
        throw forbidden('error.api_forbidden');
      }
    } else {
      const isInvalid = (currentRole: string[]) => _.difference(allowedRoles, currentRole).length <= 0;
      const currentLoggedInUserRole: string[] = ctx.state.user.roles;
      if (!isInvalid(currentLoggedInUserRole)) {
        throw forbidden('error.api_forbidden');
      }
    }
    await next();
  };
};
export default authorization;
