import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class JWTUriExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    console.log('JWTUriExceptionFilter', exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response
      .status(401)
      .json({
        statusCode: 401,
        messageText: 'You token is invalid or expired. Request a new link to reset your password.',
      });
  }
}
