import Joi from 'joi';
import { Account_type_enum } from '../models/users_model';

export function validate_user_acount_payload(value: any) {
  return Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    mobile: Joi.object({
      mobile: Joi.string().required(),
      mobileExtension: Joi.string().required(),
      rawMobile: Joi.string().required(),
    }).required(),
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    account_type: Joi.string()
      .valid(...Object.values(Account_type_enum))
      .required(),
    address: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
      address: Joi.string().required(),
      details: Joi.array().items(Joi.string()), // Adjust the details validation as needed
      country: Joi.string().required(),
      city: Joi.string().required(),
    }).optional(),
  }).validate(value);
}
