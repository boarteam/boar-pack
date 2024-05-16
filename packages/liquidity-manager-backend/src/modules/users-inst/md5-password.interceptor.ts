import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { UsersInstService } from "./users-inst.service";

@Injectable()
export class Md5PasswordInterceptor implements NestInterceptor {
  constructor(
    private readonly users: UsersInstService,
  ) {}

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

      request.body.password = this.users.generatePasswordHash(name, request.body.password);
    }

    return next.handle();
  }
}
