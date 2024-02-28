import { Injectable } from "@nestjs/common";
import { TUsersConfig, UsersConfigService } from "./users.config";
import bcrypt from "bcrypt";

@Injectable()
export class BcryptService {
  private config: TUsersConfig;

  constructor(
    private usersConfig: UsersConfigService,
  ) {
    this.config = this.usersConfig.config;
  }

  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.config.saltRounds);
  }
}

export default BcryptService;
