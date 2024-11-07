import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Determine the HTTP status
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Construct the error response
    let message = 'Internal server error' as string | Record<string, any>;
    if (exception instanceof HttpException) {
      message = exception.getResponse() as string | Record<string, any>;
    }

    // If message is an object and contains a 'message' property, extract it to avoi>
    if (message && typeof message === 'object' && message.message) {
      message = message.message as string;
    }
    // console.error({ stack: exception as any });
    const errorResponse: {
      statusCode: number;
      timestamp: string;
      path: any;
      message: string;
    } = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message as string,
    };

    // Send the response without stack trace
    response.status(status).json(errorResponse);
  }
}
