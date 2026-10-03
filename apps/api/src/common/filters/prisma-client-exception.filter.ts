import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

const ERROR_NAMES: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.CONFLICT]: 'Conflict',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
};

/**
 * Global Exception Filter for Prisma Client Known Request Errors.
 * Sanitizes raw database errors (P2002, P2025, P2003) into standard HTTP responses,
 * preventing database schema leaks and internal table names from escaping to clients.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected database error occurred';

    switch (exception.code) {
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        const target = Array.isArray(exception.meta?.target)
          ? (exception.meta.target as string[]).join(', ')
          : typeof exception.meta?.target === 'string'
            ? exception.meta.target
            : 'value';
        message = `A record with this ${target} already exists`;
        break;
      }
      case 'P2025': {
        status = HttpStatus.NOT_FOUND;
        message = 'The requested resource was not found';
        break;
      }
      case 'P2003': {
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid reference: related entity does not exist';
        break;
      }
      default: {
        this.logger.error(
          `Unhandled Prisma Error [${exception.code}]: ${exception.message}`,
          exception.stack,
        );
        break;
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: ERROR_NAMES[status] || 'Error',
    });
  }
}
