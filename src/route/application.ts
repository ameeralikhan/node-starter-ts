import * as Router from 'koa-router';

import * as ctrl from '../controller/application';
import authentication from '../middleware/authentication';
import authorization from '../middleware/authorization';
import { Role } from '../enum/role';

const router = new Router({
  prefix: `/api/application`,
});

router.use(authentication);

router.get('/', ctrl.getCurrentLoggedInUserApplications);

router.use(authorization(false, [Role.SUPER_ADMIN, Role.APP_CREATOR]));

router.get('/execution/all', ctrl.getAllExecution);

router.get('/execution/:executionId/id', ctrl.getExecutionById);

router.get('/:applicationId', ctrl.getApplicationById);

router.put('/:applicationId/publish', ctrl.publishApplication);

router.get('/:applicationId/section/:sectionId', ctrl.getApplicationFormSectionById);

router.get('/:applicationId/field/:fieldId', ctrl.getApplicationFormFieldById);

router.get('/:applicationId/form', ctrl.getApplicationForm);

router.get('/:applicationId/workflow', ctrl.getApplicationWorkflow);

router.get('/:applicationId/field-permission', ctrl.getApplicationWorkflowFieldPermission);

router.get('/:applicationId/execution', ctrl.getApplicationExecution);

router.post('/', ctrl.saveApplication);

router.post('/:applicationId/form', ctrl.saveApplicationForm);

router.post('/:applicationId/workflow', ctrl.saveApplicationWorkflow);

router.post('/:applicationId/field-permission', ctrl.saveApplicationWorkflowFieldPermission);

router.post('/:applicationId/execution', ctrl.saveApplicationExecution);

router.delete('/execution/:executionId', ctrl.deleteApplicationExecution);

router.delete('/:id', ctrl.deleteApplication);

export default router.routes();
