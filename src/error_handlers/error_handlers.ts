import { Response, Request, NextFunction } from 'express';
import { return_response } from '../response_handler/response_handler';
import logger from '../logger/logger';

class Error_object extends Error {
  constructor(public name: string, public status_code: number) {
    super();
  }
}

export class User_Request_Error extends Error_object {
  constructor(message: string) {
    super('USER_REQUEST_ERROR', 400);
    this.message = message;
  }
}

export class Unauthorized_Error extends Error_object {
  constructor(message: string) {
    super('AUTHENTICATION_ERROR', 401);
    this.message = message;
  }
}

export class Forbidden_Error extends Error_object {
  constructor(message: string) {
    super('ACCESS_DENIED', 403);
    this.message = message;
  }
}

export class Not_Found_Error extends Error_object {
  constructor(message: string) {
    super('NOT_FOUND_ERROR', 404);
    this.message = message;
  }
}

export class Duplicate_Resource_Error extends Error_object {
  constructor(message: string) {
    super('DUPLICATE_RESOURCE_ERROR', 409);
    this.message = message;
  }
}

export class Validation_Error extends Error_object {
  constructor(message: string) {
    super('VALIDATION_ERROR', 422);
    this.message = message;
  }
}

export class Server_Error extends Error_object {
  constructor(message: string) {
    super('SERVER_ERROR', 500);
    this.message = message;
  }
}

export class Database_Error extends Error_object {
  constructor(message: string) {
    super('DATABASE_ERROR', 503);
    this.message = message;
  }
}

export const Not_Found_Error_Handler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  throw new Not_Found_Error('Resource not found.');
};

export const Server_Error_Handler = (
  error: Error_object,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { status_code = 500, message } = error;
  if (status_code === 422) {
    logger.error(message, { DATE: new Date() });
  } else {
    logger.error(message, { STACK_TRACE: error, DATE: new Date() });
  }

  return return_response({
    req,
    res,
    message,
    status_code,
  });
};
