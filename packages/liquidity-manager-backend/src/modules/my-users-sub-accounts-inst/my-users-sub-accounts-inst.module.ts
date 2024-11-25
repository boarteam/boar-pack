import { Module } from '@nestjs/common';
import { MyUsersSubAccountsInstController } from './my-users-sub-accounts-inst.controller';
import { UsersSubAccountsInstModule } from '../users-sub-accounts-inst/users-sub-accounts-inst.module';

@Module({
  imports: [
    UsersSubAccountsInstModule,
  ],
  controllers: [MyUsersSubAccountsInstController],
  providers: [],
  exports: [],
})
export class MyUsersSubAccountsInstModule {}
