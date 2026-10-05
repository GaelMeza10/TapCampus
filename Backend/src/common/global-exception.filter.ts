import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { STATUS_CODES } from 'node:http';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  constructor(private readonly adapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const error = STATUS_CODES[statusCode] ?? 'Error';
    const response =
      exception instanceof HttpException ? exception.getResponse() : null;
    const body =
      typeof response === 'object' && response !== null
        ? { error, ...response, statusCode }
        : { statusCode, message: response ?? 'Internal server error', error };
    if (!(exception instanceof HttpException)) {
      this.logger.error('Error interno no controlado');
    }
    this.adapterHost.httpAdapter.reply(
      host.switchToHttp().getResponse(),
      body,
      statusCode,
    );
  }
}
