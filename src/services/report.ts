
import * as boom from 'boom';
import * as _ from 'lodash';
import * as moment from 'moment';
import { validate } from '../validations/index';

import * as helper from '../utils/helper';
import * as joiSchema from '../validations/schemas/application';
import * as applicationExecutionRepo from '../repositories/application-execution';
import * as applicationExecutionWorkflowRepo from '../repositories/application-execution-workflow';
import { IApplicationExecutionInstance, IApplicationExecutionAttributes } from '../models/application-execution';
import { ApplicationExecutionStatus } from '../enum/application';
import { IExecutionWorkflowCount,
    IMyItemReport,
    IUserWorkloadReport,
    ITimeApplicationReport,
    ITimeApplicationResponse,
    IGetExecutionTimelineSelect,
    ITotalExecutionCount,
    ITotalExecutionMonthGraph
} from '../interface/application';

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
            applicationId: groupedExecutions[key][0].id,
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

export const getApplicationExecutionTimeReport =
    async (payload: ITimeApplicationReport): Promise<ITimeApplicationResponse[]> => {
    await validate(payload, joiSchema.getApplicationExecutionTimeReport);
    const dbApplicationExecutions: IGetExecutionTimelineSelect[] = await
        applicationExecutionRepo.getApplicationExecutionsForTimeReport(payload.applicationId,
            payload.startDate, payload.endDate);
    const response: ITimeApplicationResponse[] = [];
    const ids = dbApplicationExecutions.map((execution) => execution.id);
    const executionWorkflows = await applicationExecutionWorkflowRepo.getByApplicationExecutionIds(ids);
    for (const execution of dbApplicationExecutions) {
        const responseExecution: ITimeApplicationResponse = {
            applicationId: execution.applicationId,
            title: execution.title,
            timeline: []
        };
        const appExecutionWorklows = executionWorkflows.filter((workflow) =>
            workflow.applicationExecutionId === execution.id);
        for (const workflowExecution of appExecutionWorklows) {
            if (!workflowExecution.applicationWorkflow || !responseExecution.timeline) {
                continue;
            }
            const timestamp = moment(workflowExecution.updatedAt).diff(moment(workflowExecution.createdAt));
            const duration = moment.duration(timestamp);
            responseExecution.timeline.push({
                workflowType: workflowExecution.applicationWorkflow.type,
                startedAt: workflowExecution.createdAt,
                endAt: workflowExecution.updatedAt,
                timestamp: `${duration.get('h')}:${duration.get('m')}:${duration.get('s')}`
            });
        }
        response.push(responseExecution);
    }
    return response;
};

export const getTotalExecutionsCountReport = async (payload: ITimeApplicationReport): Promise<ITotalExecutionCount> => {
    await validate(payload, joiSchema.getApplicationExecutionTimeReport);
    const dbApplicationExecutions = await
        applicationExecutionRepo.getTotalApplicationExecutionQuery(payload.applicationId,
            payload.startDate, payload.endDate);
    const response: ITotalExecutionCount = {
        total: dbApplicationExecutions.length,
        completed: 0,
        inProgress: 0,
        rejected: 0
    };
    const ids = dbApplicationExecutions.map((execution) => execution.id);
    const workflows = await applicationExecutionWorkflowRepo.getByApplicationExecutionIds(ids);
    for (const execution of dbApplicationExecutions) {
        const currentWorkflows = workflows.filter(ex => ex.applicationExecutionId === execution.id);
        response.completed += currentWorkflows[0].status === ApplicationExecutionStatus.APPROVED ? 1 : 0;
        response.inProgress += currentWorkflows[0].status === ApplicationExecutionStatus.DRAFT ? 1 : 0;
        response.rejected += currentWorkflows[0].status === ApplicationExecutionStatus.REJECT ? 1 : 0;
    }
    return response;
};

export const getTotalExecutionsCountGraph =
    async (payload: ITimeApplicationReport): Promise<ITotalExecutionMonthGraph> => {
    await validate(payload, joiSchema.getApplicationExecutionTimeReport);
    const dbApplicationExecutions = await
        applicationExecutionRepo.getTotalApplicationExecutionQuery(payload.applicationId,
            payload.startDate, payload.endDate);
    const response: ITotalExecutionMonthGraph = {
        categories: [],
        data: []
    };
    const startMonth = moment(payload.startDate).month();
    const diffMonth = moment(payload.endDate).diff(payload.startDate, 'month');
    for (let i = 0; i <= diffMonth; i++) {
        response.categories.push(moment.months(startMonth + i));
        const startDateOfMonth = moment(payload.startDate).add(i + 1, 'month').date(1);
        const endDateOfMonth = startDateOfMonth.endOf('month');
        const ids = dbApplicationExecutions.filter(execution => moment(execution.createdAt) >= startDateOfMonth
            && moment(execution.createdAt) < endDateOfMonth).map(exec => exec.id);
        const data = {
            total: 0,
            completed: 0,
            inProgress: 0,
            rejected: 0
        };
        if (!ids.length) {
            response.data.push(data);
            continue;
        }
        const workflows = await applicationExecutionWorkflowRepo.getByApplicationExecutionIds(ids);
        data.total = workflows.length;
        for (const execution of dbApplicationExecutions) {
            const currentWorkflows = workflows.filter(ex => ex.applicationExecutionId === execution.id);
            data.completed += currentWorkflows[0].status === ApplicationExecutionStatus.APPROVED ? 1 : 0;
            data.inProgress += currentWorkflows[0].status === ApplicationExecutionStatus.DRAFT ? 1 : 0;
            data.rejected += currentWorkflows[0].status === ApplicationExecutionStatus.REJECT ? 1 : 0;
        }
        response.data.push(data);
    }
    return response;
};
