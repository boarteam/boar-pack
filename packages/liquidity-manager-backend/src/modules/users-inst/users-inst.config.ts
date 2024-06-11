import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type TUsersInstConfig = {
  managerPanelHost?: string;
};

@Injectable()
export class UsersInstConfigService {
  constructor(private configService: ConfigService) {
  }

  get config(): TUsersInstConfig {
    const managerPanelHost = this.configService.get<string>('MANAGER_PANEL_URL');

    return {
      managerPanelHost,
    };
  }
}
