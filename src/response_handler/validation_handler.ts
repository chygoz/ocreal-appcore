import { ValidationError as InputError } from 'joi';
import { Validation_Error } from '../error_handlers/error_handlers';

export const validation_error_handler = (error: InputError) => {
  const { details } = error;
  const errorMessage = details[0].message;
  throw new Validation_Error(errorMessage);
};
