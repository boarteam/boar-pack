import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type TBcryptConfig = {
  saltRounds: number;
};

@Injectable()
export class BcryptConfigService {
  constructor(private configService: ConfigService) {
  }

  get config(): TBcryptConfig {
    const saltRounds = Number.parseInt(this.configService.get<string>('BCRYPT_SALT_ROUNDS', ''), 10);

    if (!Number.isInteger(saltRounds)) {
      throw new Error('BCRYPT_SALT_ROUNDS is not defined, set it as integer');
    }

    return {
      saltRounds,
    };
  }
}
