import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor
} from '@nestjs/common';
import { UsersInstService } from "./users-inst.service";
import { EcnPasswordHashType } from "./users-inst.constants";

@Injectable()
export class PasswordInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PasswordInterceptor.name);

  constructor(
    private readonly users: UsersInstService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ) {
    const request = context.switchToHttp().getRequest();

    if (request.body?.password) {
      const { id, pwdHashType } = request.body;
      if (id === undefined || pwdHashType === undefined) {
        throw new BadRequestException('id and pwdHashType are required while setting password');
      }

      if (pwdHashType !== EcnPasswordHashType.MD5 && pwdHashType !== EcnPasswordHashType.BCRYPT) {
        throw new BadRequestException('pwdHashType must be either 0 or 1');
      }

      const passParams = await this.users.generatePassword({
        id,
        password: request.body.password,
        pwdHashTypeId: pwdHashType
      });

      request.body.password = passParams.password;
      request.body.salt = passParams.salt;
    }

    return next.handle();
  }
}
