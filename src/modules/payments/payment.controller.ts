import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaginationDto } from 'src/constants/pagination.dto';
import { Response, Request } from 'express';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('/user/payments')
  async getAllUserPayments(
    @Res() res: Response,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.paymentService.getAllUserPayments(
      req.user,
      paginationDto,
    );
    this._sendResponse({
      res,
      message: 'Payments found',
      data,
    });
  }

  @Get('/agent/payments')
  async getAllAgentPayments(
    @Res() res: Response,
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.paymentService.getAllAgentPayments(
      req.agent,
      paginationDto,
    );
    this._sendResponse({
      res,
      message: 'Payments found',
      data,
    });
  }

  private _sendResponse({
    res,
    message,
    statusCode,
    data,
  }: {
    res: Response;
    message: string;
    statusCode?: number;
    data?: any;
  }): void {
    const responseData = {
      message,
      data,
      success: statusCode >= 300 ? false : true,
    };
    const statsu_code = statusCode ? statusCode : 200;
    res.status(statsu_code).json(responseData);
  }
}
