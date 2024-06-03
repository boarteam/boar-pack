import { Injectable, PreconditionFailedException } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import { TUsersInstConfig, UsersInstConfigService } from "./users-inst.config";

@Injectable()
export class UsersInstAuthService {
  private readonly config: TUsersInstConfig;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: UsersInstConfigService,
  ) {
    this.config = this.configService.config;
  }

  generatePasswordResetUrl(userId: string): string {
    if (!this.config.managerPanelHost) {
      throw new PreconditionFailedException('MANAGER_PANEL_HOST env variable is not set');
    }


    const token = this.jwtService.sign({ sub: userId }, {
      expiresIn: '1d',
    });

    return this.config.managerPanelHost + `/reset-password/${token}`;
  }
}
