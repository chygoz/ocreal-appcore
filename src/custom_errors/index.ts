import { HttpException, HttpStatus } from '@nestjs/common';

export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}

export class DuplicateException extends HttpException {
  constructor(message = 'Duplicated Error') {
    super(message, HttpStatus.CONFLICT);
  }
}
