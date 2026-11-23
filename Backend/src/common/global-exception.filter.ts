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
    // Errores del parser de Express/multer: llegan en inglés y técnicos.
    if (statusCode === 413) {
      Object.assign(body, {
        message: 'La solicitud es demasiado grande. Usa una imagen más ligera (máx. 5 MB) o un texto más corto.',
      });
    } else if (
      statusCode === 400 &&
      typeof body.message === 'string' &&
      /JSON|Unexpected token|Expected .* in JSON|Unexpected end/i.test(body.message)
    ) {
      Object.assign(body, { message: 'Los datos enviados no tienen un formato válido.' });
    }
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
