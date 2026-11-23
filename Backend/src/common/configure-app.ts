import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { GlobalExceptionFilter } from './global-exception.filter';
import { spanishValidationErrors } from './validation-messages';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { uploadsDirectory } from '../uploads/uploads.config';

export function configureApp(app: INestApplication) {
  (app as NestExpressApplication).useStaticAssets(uploadsDirectory(), {
    prefix: '/uploads/',
    index: false,
    dotfiles: 'deny',
    setHeaders: (response) => {
      response.setHeader('X-Content-Type-Options', 'nosniff');
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: spanishValidationErrors,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter(app.get(HttpAdapterHost)));
  const origins = (
    process.env.CORS_ORIGINS ?? 'http://localhost:8081,http://localhost:19006'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origins,
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  });
  app.enableShutdownHooks();
}
