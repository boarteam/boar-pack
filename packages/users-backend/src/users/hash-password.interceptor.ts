import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import BcryptService from "../bcrypt/bcrypt.service";

@Injectable()
export class HashPasswordInterceptor implements NestInterceptor {
  constructor(
    private bcryptService: BcryptService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ) {
    const request = context.switchToHttp().getRequest();

    if (request.body?.pass) {
      request.body.pass = await this.bcryptService.hashPassword(request.body.pass);
    }

    return next.handle();
  }
}
