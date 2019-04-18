import * as Joi from 'joi';

export const userRequest: Joi.SchemaMap = {
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  contactNo: Joi.string().required(),
  pictureUrl: Joi.string(),
  gender: Joi.string().required(),
  country: Joi.string().required(),
  city: Joi.string().required(),
  countryOfBirth: Joi.string().required(),
  skypeId: Joi.string().required(),
  yearOfBirth: Joi.number().required(),
  timezone: Joi.string()
};