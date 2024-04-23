import { Module } from '@nestjs/common';
import { EcnConnectSchemaService } from './ecn-connect-schema.service';
import { EcnConnectSchemaController } from './ecn-connect-schema.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcnConnectSchema } from './entities/ecn-connect-schema.entity';
import { AMTS_DB_NAME } from "../liquidity-app.config";

@Module({
  imports: [
    TypeOrmModule.forFeature([EcnConnectSchema], AMTS_DB_NAME),
  ],
  providers: [
    EcnConnectSchemaService,
  ],
  exports: [
    EcnConnectSchemaService,
  ],
  controllers: [EcnConnectSchemaController],
})
export class EcnConnectSchemaModule {}
