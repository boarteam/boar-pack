import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor
} from '@nestjs/common';
import { UsersInstService } from "./users-inst.service";
import bcrypt from "bcrypt";

enum EcnPasswordHashType {
  MD5 = 0,
  BCRYPT = 1,
}

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
      const { name, pwdHashType } = request.body;
      if (name === undefined || pwdHashType === undefined) {
        throw new BadRequestException('name and pwdHashType are required while setting password');
      }

      if (pwdHashType !== EcnPasswordHashType.MD5 && pwdHashType !== EcnPasswordHashType.BCRYPT) {
        throw new BadRequestException('pwdHashType must be either 0 or 1');
      }

      if (pwdHashType === EcnPasswordHashType.MD5) {
        this.logger.log('Generating MD5 password hash');
        request.body.password = this.users.generateMd5PasswordHash(name, request.body.password);
      } else {
        this.logger.log('Generating bcrypt password hash');
        const salt = await bcrypt.genSalt();
        request.body.password = await bcrypt.hash(request.body.password, salt);
        request.body.salt = salt;
      }

    }

    return next.handle();
  }
}
