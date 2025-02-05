import { Injectable } from "@nestjs/common";
import { TBcryptConfig, BcryptConfigService } from "./bcrypt.config";
import bcrypt from "bcrypt";

@Injectable()
export class BcryptService {
  private config: TBcryptConfig;

  constructor(
    private usersConfig: BcryptConfigService,
  ) {
    this.config = this.usersConfig.config;
  }

  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.config.saltRounds);
  }
}

export default BcryptService;
