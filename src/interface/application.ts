export interface ISaveApplicationForm {
    id?: string;
    name: string;
    helpText: string;
    type: string;
    order: number;
    fields: ISaveApplicationFormField[];
}

export interface ISaveApplicationFormField {
    id?: string;
    name: string;
    helpText: string;
    fieldId: string;
    key: string;
    type: string;
    defaultValue: string;
    templateOptions: any;
    order: number;
    isRequired: boolean;
}

export interface IExecutionWorkflowCount {
    approval: number;
    inputRequest: number;
    clarification: number;
    draft: number;
    approved: number;
    reject: number;
    participated: number;
}

export interface IGetExecutionSelect {
    id: string;
    applicationId: string;
    title: string;
    createdAt: Date;
    createdBy: string;
    managerId: string;
    departmentId: number;
    officeLocationId: number;
    applicationWorkflowId: string;
    showMap: boolean;
}

export interface IMyItemReport {
    applicationId: string;
    applicationName: string;
    inProgress: number;
    completed: number;
    rejected: number;
}

export interface IUserWorkloadReport {
    applicationId: string;
    applicationName: string;
    assignToMe: number;
}

export interface IGetExecutionTimelineSelect {
    id: string;
    title: string;
    createdAt: Date;
    createdBy: string;
    applicationId: string;
    longitude: number;
    latitude: number;
}

export interface ITimeApplicationReport {
    applicationId: string;
    startDate: string;
    endDate: string;
}

export interface ITimeApplicationResponse {
    applicationId?: string;
    id?: string;
    title?: string;
    timeline?: IExecutionTimeline[];
}

export interface IExecutionTimeline {
    workflowType?: string;
    startedAt?: Date;
    endAt?: Date;
    timestamp?: string;
}

export interface ITotalExecutionCount {
    total: number;
    completed: number;
    inProgress: number;
    rejected: number;
}

export interface ITotalExecutionMonthGraph {
    categories: string[];
    data: ITotalExecutionCount[];
}

export interface IExecutionLocation {
    applicationId: string;
    id: string;
    title: string;
    latitude: number;
    longitude: number;
}

export interface IReassignExecutionRequest {
    applicationId: string;
    executionId: string;
    workflowId: string;
    userId: string;
}

export interface IGetParticipatedUserSelect {
    createdBy: string;
    updatedBy: string;
}
