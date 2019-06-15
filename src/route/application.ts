import * as Router from 'koa-router';

import * as ctrl from '../controller/application';
import authentication from '../middleware/authentication';
import authorization from '../middleware/authorization';
import { Role } from '../enum/role';

const router = new Router({
  prefix: `/api/application`,
});

router.use(authentication);
router.use(authorization(false, [Role.SUPER_ADMIN, Role.APP_CREATOR]));

router.get('/', ctrl.getCurrentLoggedInUserApplications);

router.get('/:id', ctrl.getApplicationById);

router.get('/:id/section/:sectionId', ctrl.getApplicationFormSectionById);

router.get('/:id/field/:fieldId', ctrl.getApplicationFormFieldById);

router.get('/:applicationId/form', ctrl.getApplicationForm);

router.get('/:applicationId/workflow', ctrl.getApplicationWorkflow);

router.get('/:applicationId/field-permission', ctrl.getApplicationWorkflowFieldPermission);

router.post('/', ctrl.saveApplication);

router.post('/:applicationId/form', ctrl.saveApplicationForm);

router.post('/:applicationId/workflow', ctrl.saveApplicationWorkflow);

router.post('/:applicationId/field-permission', ctrl.saveApplicationWorkflowFieldPermission);

router.delete('/:id', ctrl.deleteApplication);

export default router.routes();
