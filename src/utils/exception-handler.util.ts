import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export default class ExceptionsHandler implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.status ?? 500;

    let message = '';

    message = exception?.response?.message ?? exception.message;

    return response.status(status).status(status).json({
      status: false,
      message: message.toString(),
      data: {},
    });
  }
}
