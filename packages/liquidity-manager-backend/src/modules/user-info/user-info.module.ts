import { Module } from '@nestjs/common';
import { UserInfoService } from './user-info.service';
import { UserInfoController } from './user-info.controller';
import { AmtsDcModule } from "../amts-dc/amts-dc.module";
import { UsersInstModule } from "../users-inst/users-inst.module";

@Module({})
export class UserInfoModule {
  static forRestApi() {
    return {
      module: UserInfoModule,
      imports: [
        AmtsDcModule,
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

  static forFeature() {
    return {
      module: UserInfoModule,
      imports: [
        AmtsDcModule,
        UsersInstModule.forFeature(),
      ],
      providers: [
        UserInfoService,
      ],
      exports: [
        UserInfoService,
      ],
    };
  }
}
