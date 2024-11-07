import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { json, urlencoded } from 'express';
import * as sanitizer from 'express-mongo-sanitize';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AllExceptionsFilter } from './modules/middlewares/exception-handler.util';
import { HttpExceptionFilter } from './modules/middlewares/http-exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET, HEAD, PUT, POST, DELETE, OPTIONS',
    credentials: true,
  });

  app.useWebSocketAdapter(new IoAdapter(app));
  app.use(sanitizer());
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  app.use(morgan('dev'));
  app.setGlobalPrefix('/v1', {
    exclude: ['/'],
  });
  app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const PORT = process.env.PORT;

  await app.listen(PORT).then(() => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
bootstrap();
