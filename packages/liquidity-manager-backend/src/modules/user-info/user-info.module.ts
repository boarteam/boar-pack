import { Module } from '@nestjs/common';
import { UserInfoService } from './user-info.service';
import { UserInfoController } from './user-info.controller';
import { TpDcModule } from "../tp-dc/tp-dc.module";
import { UsersInstModule } from "../users-inst/users-inst.module";

@Module({})
export class UserInfoModule {
  static forRestApi() {
    return {
      module: UserInfoModule,
      imports: [
        TpDcModule,
        UsersInstModule.forFeature(),
      ],
      providers: [
        UserInfoService,
      ],
      exports: [
        UserInfoService,
      ],
      controllers: [
        UserInfoController,
      ]
    };
  }
}
