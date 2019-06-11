import * as Router from 'koa-router';

import * as ctrl from '../controller/lookup';
import authentication from '../middleware/authentication';
import authorization from '../middleware/authorization';
import { Role } from '../enum/role';

const router = new Router({
  prefix: `/api/lookup`,
});

router.use(authentication);
router.use(authorization(false, [Role.SUPER_ADMIN]));

router.get('/', ctrl.getAll);

router.get('/:lookupId/data', ctrl.findByLookupId);

router.post('/', ctrl.saveLookup);

router.post('/:lookupId/data', ctrl.saveLookupData);

router.delete('/:id', ctrl.deleteLookup);

router.delete('/:lookupId/data/:id', ctrl.deleteLookupData);

export default router.routes();
