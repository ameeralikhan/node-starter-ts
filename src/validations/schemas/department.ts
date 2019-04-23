import * as Joi from 'joi';

export const saveDepartment: Joi.SchemaMap = {
    name: Joi.string().required(),
    userId: Joi.string().uuid().allow([null, ''])
};
