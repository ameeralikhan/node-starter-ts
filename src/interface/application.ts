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
    title: string;
    createdAt: Date;
    createdBy: string;
    managerId: string;
    departmentId: number;
    officeLocationId: number;
    applicationWorkflowId: string;
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
}

export interface ITimeApplicationReport {
    applicationId: string;
    startDate: Date;
    endDate: Date;
}

export interface ITimeApplicationResponse {
    applicationId?: string;
    title?: string;
    timeline?: IExecutionTimeline[];
}

export interface IExecutionTimeline {
    workflowType?: string;
    startedAt?: Date;
    endAt?: Date;
    timestamp?: string;
}
