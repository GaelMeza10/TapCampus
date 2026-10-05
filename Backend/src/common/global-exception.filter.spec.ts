import {
  ArgumentsHost,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  const reply = jest.fn();
  const response = {};
  const host = {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost;
  const filter = new GlobalExceptionFilter({
    httpAdapter: { reply },
  } as unknown as HttpAdapterHost);
  beforeEach(() => reply.mockClear());

  it('conserva la lista de validación y código HTTP', () => {
    filter.catch(
      new BadRequestException(['email inválido', 'campo obligatorio']),
      host,
    );
    expect(reply).toHaveBeenCalledWith(
      response,
      {
        statusCode: 400,
        message: ['email inválido', 'campo obligatorio'],
        error: 'Bad Request',
      },
      400,
    );
  });
  it('conserva errores HTTP de negocio', () => {
    filter.catch(new ForbiddenException('Sin permiso'), host);
    expect(reply).toHaveBeenCalledWith(
      response,
      { statusCode: 403, message: 'Sin permiso', error: 'Forbidden' },
      403,
    );
  });
  it('oculta detalles internos tanto en respuesta como en log', () => {
    const logger = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    filter.catch(new Error('password=fixture-secret'), host);
    expect(reply).toHaveBeenCalledWith(
      response,
      {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
      },
      500,
    );
    expect(logger).toHaveBeenCalledWith('Error interno no controlado');
    logger.mockRestore();
  });
});
