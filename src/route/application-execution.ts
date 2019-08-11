import * as Router from 'koa-router';

import * as ctrl from '../controller/application';
import authentication from '../middleware/authentication';
import authorization from '../middleware/authorization';
import { Role } from '../enum/role';

const router = new Router({
  prefix: `/api/application-execution`,
});

router.use(authentication);

router.get('/all', authorization(false, [Role.SUPER_ADMIN]), ctrl.getAllExecution);

router.get('/:applicationId/execution', ctrl.getApplicationExecution);

router.get('/workflow', ctrl.getExecutionByLoggedInUserId);

router.get('/workflow/action', ctrl.getExecutionInProcessLoggedInUserId);

router.get('/:executionId/detail', ctrl.getExecutionById);

router.post('/:applicationId/execution', ctrl.saveApplicationExecution);

router.put('/:applicationId/execution/:applicationExecutionId/publish', ctrl.publishApplicationExecution);

// tslint:disable-next-line:max-line-length
router.put('/:applicationId/execution/:applicationExecutionId/workflow/:applicationExecutionWorkflowId', ctrl.saveApplicationExecutionWorkflow);

router.delete('/execution/:executionId', ctrl.deleteApplicationExecution);

export default router.routes();
