import * as Joi from 'joi';

export const saveRole: Joi.SchemaMap = {
    name: Joi.string().required(),
    userId: Joi.string().uuid().allow([null, ''])
};

export const deleteRole: Joi.SchemaMap = {
    id: Joi.number().required(),
};
