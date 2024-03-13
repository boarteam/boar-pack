import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Joi from "joi";

export type TScryptConfig = {
  salt: string;
  iv: string;
};

@Injectable()
export class ScryptConfigService {
  private ivSchema = Joi.string().length(16).hex();

  constructor(private configService: ConfigService) {
  }

  get config(): TScryptConfig {
    const salt = this.configService.get<string>('SCRYPT_SALT');
    const iv = this.configService.get<string>('SCRYPT_IV');

    if (!salt || !iv) {
      throw new Error('SCRYPT_SALT or SCRYPT_IV env variables are not set');
    }

    const { error } = this.ivSchema.validate(iv);
    if (error) {
      console.error('IV is invalid:', error.details[0].message);
      throw new Error('IV is invalid, check SCRYPT_IV env variable');
    }

    return {
      salt,
      iv,
    };
  }
}
