import { Module } from "@nestjs/common";
import BcryptService from "./bcrypt.service";
import { ConfigModule } from "@nestjs/config";
import { BcryptConfigService } from "./bcrypt.config";

@Module({
  imports: [
    ConfigModule,
  ],
  providers: [
    BcryptService,
    BcryptConfigService,
  ],
  exports: [
    BcryptService,
  ],
})
export class BcryptModule {
}
