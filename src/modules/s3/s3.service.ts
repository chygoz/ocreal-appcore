import { Injectable } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  PutBucketCorsCommand,
} from '@aws-sdk/client-s3';
import { configs } from 'src/configs';
import * as AWS from 'aws-sdk';
import * as docusign from 'docusign-esign';

AWS.config.update({
  accessKeyId: configs.ACCESS_AWS_KEY,
  secretAccessKey: configs.SECRET_AWS__ACCESS_KEY,
  region: configs.AWS_REGION,
});

@Injectable()
export class S3Service {
  private async _createS3Client() {
    const credentials = {
      accessKeyId: configs.ACCESS_AWS_KEY,
      secretAccessKey: configs.SECRET_AWS__ACCESS_KEY,
      region: 'eu-north-1',
    };

    return new S3Client({
      region: 'eu-north-1',
      credentials: credentials,
    });
  }

  private async setCorsConfiguration(bucket: string) {
    const client = await this._createS3Client();
    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
          AllowedOrigins: ['*'],
          ExposeHeaders: [],
        },
      ],
    };

    const command = new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: corsConfiguration,
    });

    await client.send(command);
  }

  async getPresignedUrlFromS3(object: {
    key: string;
    bucket: string;
    expires: number;
  }) {
    await this.setCorsConfiguration(object.bucket);

    const client = await this._createS3Client();
    const getObjectParams = {
      Bucket: object.bucket,
      Key: object.key,
    };
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(client, command, {
      expiresIn: object.expires,
    });
    return url;
  }

  async putPresignedUrlToS3(object: {
    key: string;
    bucket: string;
    expires: number;
  }) {
    await this.setCorsConfiguration(object.bucket);

    const client = await this._createS3Client();
    const putObjectParams = {
      Bucket: object.bucket,
      Key: object.key,
      // ACL: 'public-read',
    };
    const command = new PutObjectCommand(putObjectParams);
    const url = await getSignedUrl(client, command, {
      expiresIn: object.expires,
    });
    return url;
  }

  async getDocumentFromS3AndPrepForDocusign(
    key: string,
    documentName: string,
    documentId: string,
  ): Promise<docusign.Document> {
    try {
      const s3 = new AWS.S3();
      const params = {
        Bucket: configs.S3_BUCKET_NAME,
        Key: key,
      };

      const data = await s3.getObject(params).promise();
      const base64Doc = data.Body.toString('base64');

      const document = new docusign.Document();
      document.documentBase64 = base64Doc;
      document.name = documentName; // or provide a different name if needed
      document.fileExtension = key.split('.').pop(); // extract the file extension
      document.documentId = documentId;

      return document;
    } catch (error) {
      throw new Error(`Failed to get document from S3: ${error.message}`);
    }
  }
}
