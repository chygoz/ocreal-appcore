import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AwsS3Service {
  private readonly s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      region: process.env.AWS_REGION as string,
    });
  }

  async uploadFile(buffer: Buffer, filename: string): Promise<string> {
    const fileKey = `uploads/${uuid()}_${filename}`;
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey,
      Body: buffer,
      ACL: 'public-read',
    };

    await this.s3.upload(params).promise();
    return fileKey;
  }
}
