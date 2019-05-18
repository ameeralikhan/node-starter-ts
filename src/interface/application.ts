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
