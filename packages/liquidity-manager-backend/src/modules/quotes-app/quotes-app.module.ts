import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JoiPipeModule } from "nestjs-joi";
import { CaslModule, JwtAuthModule } from "@jifeon/boar-pack-users-backend";
import { CaslPermissionsModule } from "../casl-permissions";
import { QuotesModule } from "../quotes/quotes.module";

@Module({})
export class QuotesAppModule {
  static forRoot(
    config: {
      dataSourceName: string;
    }
  ): DynamicModule {
    return {
      module: QuotesAppModule,
      imports: [
        ConfigModule,
        // TypeOrmModule.forRootAsync({
        //   name: AMTS_DB_NAME,
        //   imports: [
        //     ConfigModule,
        //     ClusterModule,
        //     LiquidityManagersModule.register({ dataSourceName: config.dataSourceName }),
        //   ],
        //   useClass: QuotesAppConfig,
        // }),
        JwtAuthModule.register({
          dataSourceName: config.dataSourceName,
        }),
        CaslModule.forRoot(),
        CaslPermissionsModule,
        JoiPipeModule,
        // QuotesModule.forWorker(),
      ],
      providers: [],
      exports: [],
    }
  }


  // static forManagerPanel(config: {
  //   dataSourceName: string;
  // }): DynamicModule {
  //   return {
  //     module: QuotesAppModule,
  //     imports: [
  //       ConfigModule,
  //       TypeOrmModule.forRootAsync({
  //         name: AMTS_DB_NAME,
  //         imports: [
  //           ConfigModule,
  //           ClusterModule,
  //           LiquidityManagersModule.forConfig({ dataSourceName: config.dataSourceName }),
  //         ],
  //         useClass: QuotesAppConfig,
  //       }),
  //       LMAuthModule,
  //       CaslModule,
  //       CaslPermissionsModule,
  //       JoiPipeModule,
  //       LiquidityManagersModule.register({
  //         dataSourceName: config.dataSourceName,
  //       }),
  //       ...restModules,
  //     ],
  //     providers: [],
  //     exports: [],
  //   }
  // }
}
