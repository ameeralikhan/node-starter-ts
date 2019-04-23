import * as Joi from 'joi';

export const saveGroup: Joi.SchemaMap = {
    id: Joi.number(),
    name: Joi.string().required(),
    userIds: Joi.array().items(Joi.string().uuid())
};
