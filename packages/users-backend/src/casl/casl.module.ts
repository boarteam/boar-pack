import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory';
import { APP_GUARD } from '@nestjs/core';
import { PoliciesGuard } from './policies.guard';

@Module({})
export class CaslModule {
  static forRoot() {
    return {
      module: CaslModule,
      providers: [
        CaslAbilityFactory,
        {
          provide: APP_GUARD,
          useClass: PoliciesGuard,
        },
      ],
      exports: [CaslAbilityFactory],
    }
  }

  static forFeature() {
    return {
      module: CaslModule,
      providers: [
        CaslAbilityFactory,
      ],
      exports: [CaslAbilityFactory],
    }
  }
}
