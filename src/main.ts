import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import helmet from 'helmet';
import * as sanitizer from 'express-mongo-sanitize';
import ExceptionsHandler from './utils/exception-handler.util';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Handler } from 'aws-lambda';
import { Context } from 'aws-sdk/clients/autoscaling';
import { Callback } from 'mongoose';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from 'aws-sdk';

// import dotenv from 'dotenv';

// dotenv.config();

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   app.setGlobalPrefix('api/v1');

//   app.use(helmet());

// if (process.env.NODE_ENV === 'development') {
//   app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
//     next();
//   });

//   app.enableCors({
//     allowedHeaders: '*',
//     origin: '*',
//   });
// }
//   app.use(sanitizer());
//   app.setGlobalPrefix('api/v1');
//   app.useGlobalFilters(new ExceptionsHandler());
//   app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

//   if (process.env.NODE_ENV !== 'production') {
//     app.use(morgan('dev'));
//   }

//   const PORT = parseInt(process.env.PORT, 10);

//   setTimeout(() => {
//     console.log(`Server running on http://localhost:${PORT}`);
//   }, 3000);
//   await app.listen(PORT);
// }
// bootstrap();

// let server: Handler;

// export const handler: Handler = async (
//   event: any,
//   context: Context,
//   callback: Callback,
// ) => {
//   server = server ?? (await bootstrap());
//   return server(event, context, callback);
// };

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
      next();
    });

    app.enableCors({
      allowedHeaders: '*',
      origin: '*',
    });
  }
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const PORT = parseInt(process.env.PORT, 10);
  app.enableCors();
  await app.listen(PORT).then(() => {
    console.log(`Server running on port: ${PORT}`, 'Bootstrap');
  });
}
bootstrap();
