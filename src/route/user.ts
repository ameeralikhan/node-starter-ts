import * as Router from 'koa-router';

import * as ctrl from '../controller/auth';
import * as userCtrl from '../controller/user';
import authentication from '../middleware/authentication';

const router = new Router({
  prefix: `/api/user`,
});

router.use(authentication);

router.get('/me', userCtrl.getUser);

router.put('/', userCtrl.saveUser);

router.put('/change-password', ctrl.changePassword);

export default router.routes();
