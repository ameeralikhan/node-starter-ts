import * as Router from 'koa-router';

import * as ctrl from '../controller/department';
import authentication from '../middleware/authentication';

const router = new Router({
  prefix: `/api/department`,
});

router.use(authentication);

router.post('/', ctrl.getAll);
