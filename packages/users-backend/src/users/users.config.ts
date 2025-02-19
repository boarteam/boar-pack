import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type TUsersConfig = {
  saltRounds: number;
  experimentalFeatures: string[];
};

@Injectable()
export class UsersConfigService {
  constructor(private configService: ConfigService) {
  }

  get config(): TUsersConfig {
    const saltRounds = Number.parseInt(this.configService.get<string>('BCRYPT_SALT_ROUNDS', ''), 10);
    const experimentalFeatures = this.configService.get<string>('EXPERIMENTAL_FEATURES');

    if (!Number.isInteger(saltRounds)) {
      throw new Error('BCRYPT_SALT_ROUNDS is not defined, set it as integer');
    }

    return {
      saltRounds,
      experimentalFeatures: experimentalFeatures ? experimentalFeatures.split(',') : [],
    };
  }
}
