import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { configs } from '../../configs';

@Injectable()
export class AWSService {
  private S3: S3;

  constructor() {
    this.S3 = new S3({});
  }

  async uploadFileToS3(file: any, fileNameToStore: string) {
    try {
      console.log(configs.BUCKET_NAME);

      const params = {
        Bucket: configs.BUCKET_NAME,
        Key: String(fileNameToStore),
        Body: file,
      };

      const result = await this.S3.upload(params).promise();

      return result.Location;
    } catch (error) {
      console.log(error);

      return false;
    }
  }
}
