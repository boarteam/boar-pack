import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory';
import { APP_GUARD } from '@nestjs/core';
import { PoliciesGuard } from './policies.guard';
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule,
  ],
  providers: [
    CaslAbilityFactory,
    {
      provide: APP_GUARD,
      useClass: PoliciesGuard,
    },
  ],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}
