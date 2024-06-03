import {
  BadRequestException,
  Controller,
  Get,
  ParseArrayPipe,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { S3Service } from './s3.service';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { AgentOrSellerAuthGuard } from 'src/guards/seller_or_agent.guard';
import { GetUploadUrlsDto } from './dto/create.file.dto';
import { Response, Request } from 'express';
import { configs } from 'src/configs';
import * as moment from 'moment';

@UseGuards(AgentOrSellerAuthGuard)
@Controller('file')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Get('upload-url')
  @UsePipes(new ValidationPipe({ transform: true }))
  async putFileUrl(@Req() req: Request, @Res() res: Response) {
    if (!req.query.files) {
      throw new BadRequestException('Please add files to the query');
    }
    const files = (req.query?.files as string).split(',');
    const user = req.user || req.agent;
    const failedFiles = [];
    const successfullFiles = [];
    const acceptableFiles = [
      'png',
      'jpeg',
      'jpg',
      'doc',
      'docx',
      'pdf',
      'txt',
      'rtf',
      'odt',
      'xls',
      'xlsx',
      'ppt',
      'pptx',
      'html',
      'htm',
      'md',
      'csv',
      'tsv',
      'xml',
      'json',
      'epub',
      'mobi',
      'pages',
      'key',
      'numbers',
    ];

    for (const file of files) {
      const ext = path.extname(file).split('.')[1];
      if (!acceptableFiles.includes(ext)) {
        failedFiles.push({ uploadUrl: null, filename: file, key: null });
        continue;
      }
      const key = `${user._id}/${uuidv4()}/${moment().toISOString()}.${ext}`;
      const url = await this.s3Service.putPresignedUrlToS3({
        key,
        bucket: configs.S3_BUCKET_NAME,
        expires: 300,
      });
      successfullFiles.push({ uploadUrl: url, filename: file, key });
    }

    this._sendResponse({
      res,
      message: 'File Upload Url created',
      data: { successfullFiles, failedFiles },
    });
  }

  @Get('download-url')
  async getPresignedUrl(
    @Res()
    res: Response,
    @Req() req: Request,
  ) {
    if (!req.query.files) {
      throw new BadRequestException('Please add files to the query');
    }
    const files = (req.query?.files as string).split(',');
    const successfullFiles = [];
    for (const key of files) {
      const url = await this.s3Service.getPresignedUrlFromS3({
        key,
        bucket: configs.S3_BUCKET_NAME,
        expires: 300,
      });
      successfullFiles.push({ download: url, key });
    }

    this._sendResponse({
      res,
      message: 'File Download Url created',
      data: { successfullFiles },
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
    };
    const status_code = statusCode ? statusCode : 200;
    res.status(status_code).json(responseData);
  }
}
