import { ArgumentsHost, Catch, ExceptionFilter, Logger } from "@nestjs/common";
import { QueryFailedError } from "typeorm";
import { BaseExceptionFilter } from "@nestjs/core";

enum ErrorCode {
  // pg
  UniqueViolation = '23505',

  // mysql
  FailedRemovingByForeignKey = 'ER_ROW_IS_REFERENCED',
  FailedRemovingByForeignKey2 = 'ER_ROW_IS_REFERENCED_2',
}

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter extends BaseExceptionFilter implements ExceptionFilter {
  private static uniqueConstraintMessages: Record<string, string> = {}

  public static setUniqueConstraintMessage(constraint: string, message: string) {
    this.uniqueConstraintMessages[constraint] = message;
  }

  private readonly logger = new Logger(TypeOrmExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const { code, constraint }: { code: string, constraint: string } = exception as any || {};

    this.logger.error(`QueryFailedError: ${exception.message}, code: ${code}, constraint: ${constraint}`);

    switch (code) {
      case ErrorCode.UniqueViolation:
        response
          .status(400)
          .json({
            statusCode: 400,
            message: TypeOrmExceptionFilter.uniqueConstraintMessages[constraint] || 'The record already exists',
            error: 'Bad Request',
          });
        return;

      case ErrorCode.FailedRemovingByForeignKey:
      case ErrorCode.FailedRemovingByForeignKey2:
        response
          .status(400)
          .json({
            statusCode: 400,
            message: 'System cannot remove the record, please remove all related records first',
            error: 'Bad Request',
          });
        return;
    }

    return super.catch(exception, host);
  }
}
