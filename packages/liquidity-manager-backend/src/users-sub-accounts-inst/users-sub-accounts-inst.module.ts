import { Module } from '@nestjs/common';
import { UsersSubAccountsInstService } from './users-sub-accounts-inst.service';
import { UsersSubAccountsInstController } from './users-sub-accounts-inst.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersSubAccountInst } from './entities/users-sub-account-inst.entity';
import { TP_DB_NAME } from "../liquidity-app.config";

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersSubAccountInst], TP_DB_NAME),
  ],
  providers: [
    UsersSubAccountsInstService,
  ],
  exports: [
    UsersSubAccountsInstService,
  ],
  controllers: [UsersSubAccountsInstController],
})
export class UsersSubAccountsInstModule {}
