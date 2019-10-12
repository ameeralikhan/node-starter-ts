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

export interface IMyItemReport {
    applicationId: string;
    applicationName: string;
    inProgress: number;
    completed: number;
    rejected: number;
}
