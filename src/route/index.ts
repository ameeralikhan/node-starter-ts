import * as compose from 'koa-compose';
import * as Router from 'koa-router';
import { methodNotAllowed, notImplemented } from 'boom';
import ping from './ping';
import auth from './auth';
import file from './file';
import listOfValue from './list-of-value';
import user from './user';
import department from './department';
import officeLocation from './office-location';
import group from './group';

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
  department,
  officeLocation,
  group
];

export default () => compose(routesToExport);
