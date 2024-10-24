import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule, } from '@nestjs/swagger';
import { Module } from "@nestjs/common";
import {
  AuthModule as LMAuthModule,
  LiquidityManagersModule,
  LiquidityManagersUsersModule,
  restModules
} from "./index";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AMTS_DB_NAME } from "./modules/liquidity-app/liquidity-app.config";
import { resolve } from "path";
import { ConfigModule } from "@nestjs/config";
// @ts-ignore-next-line - Ignore the error because the package on project level
import { generate } from "openapi-typescript-codegen";
import {
  PositionEventDto,
  QuoteDto,
  QuoteEventDto,
  SubscribeToPositionsEventDto,
  SubscribeToQuotesEventDto,
  SubscribeToUserInfoEventDto,
  UserInfoEventDto
} from "./modules/real-time-data/dto/real-time-data.dto";
import { WebsocketsErrorEventDto } from "@jifeon/boar-pack-common-backend";
import { entities } from "./modules/liquidity-app/liquidity-app.constants";
import { UsersModule } from "@jifeon/boar-pack-users-backend";
import { EcnSubscrSchemaController } from './modules/ecn-subscr-schema/ecn-subscr-schema.controller';
import { EcnInstrumentsController } from "./modules/ecn-instruments/ecn-instruments.controller";
import { MyInstrumentsModule } from "./modules/my-instruments/my-instruments.module";
import { MyAuditLogsModule } from "./modules/my-audit-logs/my-audit-logs.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve(__dirname, '../../.env'),
    }),
    TypeOrmModule.forRoot({
      name: AMTS_DB_NAME,
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'app',
      password: 'password',
      database: 'datacollector_d',
      entities,
    }),
    TypeOrmModule.forRoot({
      name: 'tid_db',
      type: 'postgres',
      host: 'localhost',
      port: 5470,
      username: 'app',
      password: 'password',
      database: 'admirals',
      entities: [
        resolve(__dirname, '../node_modules/@jifeon/boar-pack-users-backend/src/*/entities/*.entity.{ts,js}'),
        resolve(__dirname, '../src/modules/liquidity-managers*/entities/*.entity.{ts,js}'),
      ],
    }),
    UsersModule.register({
      dataSourceName: 'tid_db',
      withControllers: true,
    }),
    LiquidityManagersModule.register({ dataSourceName: 'tid_db' }),
    LiquidityManagersUsersModule.forTID({ dataSourceName: 'tid_db' }),
    LMAuthModule,
    MyInstrumentsModule,
    MyAuditLogsModule.forManagerPanel({
      dataSourceName: 'tid_db',
    }),
    ...restModules,
  ],
})
class Swagger {
}

async function bootstrap() {
  try {
    const app = await NestFactory.create(Swagger);
    app.get(EcnSubscrSchemaController).initSwagger();
    app.get(EcnInstrumentsController).initSwagger();

    const options: SwaggerDocumentOptions = {
      operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
      extraModels: [
        WebsocketsErrorEventDto,
        QuoteDto,
        QuoteEventDto,
        PositionEventDto,
        UserInfoEventDto,
        SubscribeToQuotesEventDto,
        SubscribeToPositionsEventDto,
        SubscribeToUserInfoEventDto,
      ],
    };

    const swaggerConfig = new DocumentBuilder()
      .setTitle('API')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig, options);

    Object.entries(document.paths).forEach(([path, pathObject]) => {
      if (path.startsWith('/liquidity/')) {
        Object.values(pathObject).forEach((methodObject) => {
          methodObject.parameters.push({
            in: 'path',
            name: 'worker',
            required: true,
            schema: {
              type: 'string',
            },
          });
        });
        document.paths['/{worker}' + path] = pathObject;
        delete document.paths[path];
      }
    });

    SwaggerModule.setup('docs', app, document);
    await app.listen(3335);
    await generate({
      input: 'http://localhost:3335/docs-json',
      output: resolve(__dirname, '../../../liquidity-manager-frontend/src/tools/api-client/generated'),
      httpClient: 'node',
      clientName: 'ApiClient',
      useOptions: true,
    });
    await app.close();
  } catch (e) {
    console.error('Error, while application initialization');
    console.error(e);
  }
}

bootstrap();
