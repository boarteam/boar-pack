import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TUser } from '../users';
import { TOKENS_AUTH } from "./tokens.constants";
import { TokensService } from "./tokens.service";
import { BcryptService } from "../bcrypt";
import Joi from "joi";

@Injectable()
export class TokensAuthStrategy extends PassportStrategy(Strategy, TOKENS_AUTH) {
  private uuidValidationSchema = Joi.string().uuid({ version: ['uuidv4'] });

  constructor(
    private tokens: TokensService,
    private bcryptService: BcryptService,
  ) {
    super();
  }

  async validate(token: string): Promise<TUser> {
    const [id, hash] = token.split('.');

    const { error } = this.uuidValidationSchema.validate(id);
    if (error || !hash) {
      throw new UnauthorizedException('Invalid token');
    }

    const tokenEntity = await this.tokens.findOne({
      relations: ['user'],
      where: {
        id,
      },
    });

    if (!tokenEntity || !await this.bcryptService.compare(hash, tokenEntity.hash)) {
      throw new UnauthorizedException('Invalid token');
    }

    const { pass, ...user } = tokenEntity.user;
    return {
      ...user,
      tokenId: tokenEntity.id,
    };
  }
}
