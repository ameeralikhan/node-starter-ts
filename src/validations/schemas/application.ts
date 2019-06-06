import * as Joi from 'joi';

export const saveApplication: Joi.SchemaMap = {
    id: Joi.string().uuid(),
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
    id: Joi.string().uuid(),
    name: Joi.string().required(),
    helpText: Joi.string().required(),
    type: Joi.string().required(),
    order: Joi.number().required(),
    applicationFormFields: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        helpText: Joi.string().required(),
        fieldId: Joi.string().required(),
        key: Joi.string().required(),
        type: Joi.string().required(),
        isRequired: Joi.boolean().required(),
        defaultValue: Joi.string().allow([null, '']),
        templateOptions: Joi.any(),
        order: Joi.number().required(),
    }))
};

export const saveApplicationFormArray: Joi.SchemaMap = {
    payload: Joi.array().items(Joi.object({
        ...saveApplicationForm
    })).min(1)
};

export const saveApplicationWorkflow: Joi.SchemaMap = {
    id: Joi.string().uuid(),
    name: Joi.string().required(),
    type: Joi.string().required(),
    order: Joi.number().required(),
    userIds: Joi.array().items(Joi.string().uuid().required())
};

export const saveApplicationWorkflowArray: Joi.SchemaMap = {
    payload: Joi.array().items(Joi.object({
        ...saveApplicationWorkflow
    })).min(1)
};
