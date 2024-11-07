import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse() as any;

    if (
      exception instanceof BadRequestException &&
      Array.isArray(exceptionResponse.message)
    ) {
      // Handle validation exceptions specifically
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: exceptionResponse.message,
        isValidationError: true,
        error: true,
      });
    } else {
      // Handle other exceptions without stack trace
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: exceptionResponse.message || exceptionResponse.error,
      });
    }
  }
}
