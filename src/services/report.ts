
import * as boom from 'boom';
import * as _ from 'lodash';
import { validate } from '../validations/index';

import * as helper from '../utils/helper';
import * as joiSchema from '../validations/schemas/application';
import * as applicationExecutionRepo from '../repositories/application-execution';
import { IApplicationExecutionInstance, IApplicationExecutionAttributes } from '../models/application-execution';
import { ApplicationExecutionStatus } from '../enum/application';
import { IExecutionWorkflowCount, IMyItemReport, IUserWorkloadReport } from '../interface/application';

export const getMyItemReport = async (loggedInUser: any) => {
    await validate({ loggedInUserId: loggedInUser.userId }, joiSchema.getExecutionParticipatedLoggedInUserId);
    const executionIds = await
        applicationExecutionRepo.getApplicationExecutionParticipatedIds(loggedInUser.userId);
    const ids: string[] = executionIds[0].map((execution: any) => execution.id);
    const myParticipatedExecutions = await
        applicationExecutionRepo.getApplicationExecutionsByIds(ids);
    const dbApplicationExecutions = await
        applicationExecutionRepo.getAll(loggedInUser.userId, true);
    const responseParticipatedItems: IMyItemReport[] = [];
    const responseMyItems: IMyItemReport[] = [];
    const participatedItems = transformExecutionData(myParticipatedExecutions);
    const myItems = transformExecutionData(dbApplicationExecutions);
    for (const item of Object.keys(participatedItems)) {
        responseParticipatedItems.push({ ...participatedItems[item] });
    }
    for (const item of Object.keys(myItems)) {
        responseMyItems.push({ ...myItems[item] });
    }
    return { participated: responseParticipatedItems, myItem: responseMyItems };
};

export const getUserWorkloadReport = async (userId: string) => {
    const dbApplicationExecutions = await
        applicationExecutionRepo.getAllForParticipatedReport(userId, true);
    const groupedExecutions = _.groupBy(dbApplicationExecutions, 'application.name');
    const response: IUserWorkloadReport[] = [];
    for (const key of Object.keys(groupedExecutions)) {
        response.push({
            applicationId: '',
            applicationName: key,
            assignToMe: groupedExecutions[key].length
        });
    }
    return response;
};

const transformExecutionData = (
    dbApplicationExecutions: IApplicationExecutionInstance[],
) => {
    const response = {};
    const applicationExecutions: IApplicationExecutionAttributes[] = [];
    for (const execution of dbApplicationExecutions) {
        const plainExecution = execution.get({ plain: true });
        if (!plainExecution.application) {
            continue;
        }
        if (!response[plainExecution.application.id]) {
            response[plainExecution.application.id] = {
                applicationId: plainExecution.application.id,
                applicationName: plainExecution.application.name,
                inProgress: 0,
                completed: 0,
                rejected: 0
            };
        }
        if (plainExecution.applicationExecutionWorkflows &&
            plainExecution.applicationExecutionWorkflows.length) {
            plainExecution.applicationExecutionWorkflows = _.sortBy(
                plainExecution.applicationExecutionWorkflows, 'createdAt').reverse();
            const executionWorkflow = plainExecution.applicationExecutionWorkflows[0];
            if (!executionWorkflow || !executionWorkflow.applicationWorkflowId) {
                continue;
            }
            if (executionWorkflow.status === ApplicationExecutionStatus.APPROVED) {
                response[plainExecution.application.id].completed += 1;
            } else if (executionWorkflow.status === ApplicationExecutionStatus.REJECT) {
                response[plainExecution.application.id].rejected += 1;
            } else if (executionWorkflow.status === ApplicationExecutionStatus.DRAFT) {
                response[plainExecution.application.id].inProgress += 1;
            }
        }
    }
    return response;
};
