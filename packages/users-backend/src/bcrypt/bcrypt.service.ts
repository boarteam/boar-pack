import { Injectable } from "@nestjs/common";
import { TBcryptConfig, BcryptConfigService } from "./bcrypt.config";
import bcrypt from "bcrypt";

@Injectable()
export class BcryptService {
  private config: TBcryptConfig;

  constructor(
    private bcryptConfig: BcryptConfigService,
  ) {
    this.config = this.bcryptConfig.config;
  }

  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.config.saltRounds);
  }

  compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

export default BcryptService;
