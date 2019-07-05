import * as Joi from 'joi';

export const saveApplication: Joi.SchemaMap = {
    id: Joi.string().uuid().allow([null, '']),
    name: Joi.string().required(),
    shortDescription: Joi.string().required(),
    userIds: Joi.string().allow([null, '']),
    canAllStart: Joi.boolean().required(),
    canAllEdits: Joi.boolean().required(),
    editableUserIds: Joi.string().allow([null, ''])
};

export const deleteApplication: Joi.SchemaMap = {
    id: Joi.string().uuid().required(),
};

export const saveApplicationForm: Joi.SchemaMap = {
    id: Joi.string().uuid().allow([null, '']),
    name: Joi.string().required(),
    helpText: Joi.string().allow([null, '']),
    type: Joi.string().required(),
    applicationFormFields: Joi.array().items(Joi.object({
        id: Joi.string().uuid().allow([null, '']),
        name: Joi.string().required(),
        helpText: Joi.string().allow([null, '']),
        fieldId: Joi.string().required(),
        key: Joi.string().required(),
        type: Joi.string().required(),
        icon: Joi.string().allow([null, '']),
        templateName: Joi.string().allow([null, '']),
        defaultValue: Joi.string().allow([null, '']),
        templateOptions: Joi.any(),
    }))
};

export const saveApplicationFormArray: Joi.SchemaMap = {
    payload: Joi.array().items(Joi.object({
        ...saveApplicationForm
    })).min(1)
};

export const saveApplicationWorkflow: Joi.SchemaMap = {
    id: Joi.string().uuid().allow([null, '']),
    name: Joi.string().required(),
    type: Joi.string().required(),
    stepId: Joi.string().uuid().allow([null, '']),
    userIds: Joi.array().items(Joi.string().uuid().required())
};

export const saveApplicationWorkflowArray: Joi.SchemaMap = {
    payload: Joi.array().items(Joi.object({
        ...saveApplicationWorkflow
    })).min(1)
};

export const saveWorkflowFieldPermission: Joi.SchemaMap = {
    id: Joi.string().uuid().allow([null, '']),
    applicationWorkflowId: Joi.string().uuid().allow([null, '']),
    applicationFormSectionId: Joi.string().allow([null, '']),
    applicationFormFieldId: Joi.string().allow([null, '']),
    permission: Joi.string().required(),
    type: Joi.string().required(),
    conditions: Joi.any()
};

export const saveWorkflowFieldPermissionArray: Joi.SchemaMap = {
    payload: Joi.array().items(Joi.object({
        ...saveWorkflowFieldPermission
    })).min(1),
    applicationId: Joi.string().uuid().required(),
};

export const saveApplicationExecution: Joi.SchemaMap = {
    id: Joi.string().uuid().allow([null, '']),
    status: Joi.string().allow([null, '']),
    applicationExecutionForms: Joi.array().items(Joi.object({
        id: Joi.string().uuid().allow([null, '']),
        applicationFormFieldId: Joi.string().uuid().required(),
        value: Joi.any().required()
    }))
};

export const saveApplicationExecutionArray: Joi.SchemaMap = {
    payload: Joi.array().items(Joi.object({
        ...saveApplicationExecution
    })).min(1),
    applicationId: Joi.string().uuid().required(),
};
