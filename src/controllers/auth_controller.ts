import { RequestHandler } from 'express';
import { validation_error_handler } from '../response_handler/validation_handler';
import { Auth_Service } from '../services/auth.service';
import { return_response } from '../response_handler/response_handler';
import { validate_user_acount_payload } from '../validators/auth_validator';

const authService = new Auth_Service();

export class Auth_Controller {
  create_user_account: RequestHandler = async (req, res) => {
    const { error, value: data } = validate_user_acount_payload(req.body);

    if (error) return validation_error_handler(error);

    const user = await authService.create_user_account(data);

    return return_response({
      req,
      res,
      status_code: 201,
      data: { user },
      message: 'Account Registration successful.',
    });
  };
}
