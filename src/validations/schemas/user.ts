import * as Joi from 'joi';

export const getUserById: Joi.SchemaMap = {
  userId: Joi.string().uuid().required()
};

export const userRequest: Joi.SchemaMap = {
  id: Joi.string().uuid(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  contactNo: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().allow(['', null]),
  pictureUrl: Joi.string(),
  gender: Joi.string(),
  country: Joi.string(),
  city: Joi.string(),
  timezone: Joi.string(),
  roleIds: Joi.array().items(Joi.number().required()).required().min(1),
};
