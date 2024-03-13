import { Module } from '@nestjs/common';
import ScryptService from "./scrypt.service";
import { ScryptConfigService } from "./scrypt.config";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule,
  ],
  controllers: [],
  providers: [
    ScryptService,
    ScryptConfigService,
  ],
  exports: [
    ScryptService,
  ],
})
export class ScryptModule {
}
