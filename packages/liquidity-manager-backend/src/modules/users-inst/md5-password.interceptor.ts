import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class Md5PasswordInterceptor implements NestInterceptor {
  constructor() {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ) {
    const request = context.switchToHttp().getRequest();

    if (request.body?.password) {
      const name = request.body.name;
      if (!name) {
        throw new BadRequestException('Name is required is change password');
      }
      const hash = createHash('md5');
      hash.update(name + request.body.password);
      request.body.password = hash.digest('hex');
    }

    return next.handle();
  }
}
