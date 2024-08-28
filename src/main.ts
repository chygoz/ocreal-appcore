import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import * as morgan from 'morgan';
import helmet from 'helmet';
import * as sanitizer from 'express-mongo-sanitize';
import ExceptionsHandler from './utils/exception-handler.util';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
// import { NestExpressApplication } from '@nestjs/platform-express';
// import serverlessExpress from '@vendia/serverless-express';
// import { Callback, Context, Handler } from 'aws-lambda';

import * as dotenv from 'dotenv';

// let server: Handler;

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
      // res.header('*', '*');
      next();
    });
  }

  if (process.env.NODE_ENV === 'production') {
    app.enableCors({
      origin: ['https://ocreal.online', 'https://www.ocreal.online'],
      methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    });
  }
  app.useWebSocketAdapter(new IoAdapter(app));
  app.use(sanitizer());
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new ExceptionsHandler());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const PORT = parseInt(process.env.PORT, 10);

  setTimeout(() => {
    console.log(`Server running on http://localhost:${PORT}`);
  }, 3000);
  await app.listen(PORT);
  // await app.init();
  // const expressApp = app.getHttpAdapter().getInstance();
  // return serverlessExpress({ app: expressApp });
}
bootstrap();

// export const handler: Handler = async (
//   event: any,
//   context: Context,
//   callback: Callback,
// ) => {
//   server = server ?? (await bootstrap());
//   return server(event, context, callback);
// };
