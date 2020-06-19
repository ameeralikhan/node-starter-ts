import * as compose from 'koa-compose';
import * as Router from 'koa-router';
import { methodNotAllowed, notImplemented } from 'boom';
import ping from './ping';
import auth from './auth';
import file from './file';
import listOfValue from './list-of-value';
import user from './user';
import role from './role';

const router = new Router({
  prefix: '/api/v1',
});

const routes = router.routes();
const allowedMethods = router.allowedMethods({
  throw: true,
  methodNotAllowed: () => methodNotAllowed(),
  notImplemented: () => notImplemented(),
});
const routesToExport = [
  routes,
  // allowedMethods,
  ping,
  auth,
  file,
  listOfValue,
  user,
  role
];

export default () => compose(routesToExport);
