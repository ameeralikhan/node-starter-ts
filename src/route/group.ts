import * as Router from 'koa-router';

import * as ctrl from '../controller/group';
import authentication from '../middleware/authentication';
import authorization from '../middleware/authorization';
import { Role } from '../enum/role';

const router = new Router({
  prefix: `/api/group`,
});

router.use(authentication);
router.use(authorization(false, [Role.SUPER_ADMIN]));

router.get('/', ctrl.getAll);

router.post('/', ctrl.saveGroup);

export default router.routes();
