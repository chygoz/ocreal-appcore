import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ZipformsService } from './zipforms.service';
import { FormAuthDto } from './dto/form.dto';

@Controller('zipforms')
export class ZipformsController {
  constructor(private readonly zipformsService: ZipformsService) {}
  @Post('authUser')
  async login(@Body() formAuthDto: FormAuthDto) {
    // Call the service to authenticate the user
    const result = await this.zipformsService.authenticateUser(formAuthDto);

    // Return the result from authentication
    return {
      status: 'success',
      data: result,
    };
  }

  @Post('createTransaction')
  async createTransaction(
    @Headers('X-Auth-ContextId') contextId: string,
    @Headers('X-Auth-SharedKey') sharedKey: string,
    @Body() transactionData: any,
  ) {
    if (!contextId || !sharedKey) {
      throw new HttpException(
        'Missing required authentication headers',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const result = await this.zipformsService.createTransaction(
      contextId,
      sharedKey,
      transactionData,
    );

    return {
      status: 'success',
      data: result,
    };
  }
  @Get('viewagentForm')
  async viewagentForm(
    @Headers('X-Auth-ContextId') contextId: string,
    @Headers('X-Auth-SharedKey') sharedKey: string,
  ) {
    if (!contextId || !sharedKey) {
      throw new HttpException(
        'Missing required authentication headers',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const result = await this.zipformsService.viewAgentLibraryForm(
      contextId,
      sharedKey,
    );

    return {
      status: 'success',
      data: result,
    };
  }
  @Get('allforms')
  async allforms(
    @Headers('X-Auth-ContextId') contextId: string,
    @Headers('X-Auth-SharedKey') sharedKey: string,
  ) {
    if (!contextId || !sharedKey) {
      throw new HttpException(
        'Missing required authentication headers',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const result = await this.zipformsService.viewAllForms(
      contextId,
      sharedKey,
    );

    return {
      status: 'success',
      data: result,
    };
  }
  @Post('addFormToTransaction')
  async formToTransaction(
    @Headers('X-Auth-contextId') contextId: string,
    @Headers('X-Auth-SharedKey') sharedKey: string,
    @Body() transactionData: any,
    @Query('transactionId') transactionId: string,
  ) {
    if (!contextId || !sharedKey) {
      throw new HttpException(
        'Missing required authentication headers',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const result = await this.zipformsService.addTransactionForm(
      contextId,
      sharedKey,
      transactionData,
      transactionId,
    );

    return {
      status: 'success',
      data: result,
    };
  }
}
