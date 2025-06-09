import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule, } from '@nestjs/swagger';
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { resolve } from "path";
import { ConfigModule } from "@nestjs/config";
// @ts-ignore-next-line - Ignore the error because the package on project level
import { generate } from "openapi-typescript-codegen";
import { QuotesStatisticModule } from "./quotes-statistic";
import { UsersConnectionsStatisticModule } from "./users-connections-statistic";
import { ProviderMonitoringModule } from "./provider-monitoring";
import { Setting } from "@boarteam/boar-pack-users-backend";
import { InstrumentsHistoryModule } from "./instruments-history";
import { ApiStatisticModule } from "./api-statistic";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve(__dirname, '../../.env'),
    }),
    TypeOrmModule.forRoot({
      name: 'boar_pack_db',
      type: 'postgres',
      host: 'localhost',
      port: 5951,
      username: 'app',
      password: 'password',
      database: 'boar_pack',
      entities: [
        resolve(__dirname, './*/entities/*.entity.{ts,js}'),
        Setting,
      ],
    }),
    QuotesStatisticModule.forRoot({
      dataSourceName: 'boar_pack_db',
    }),
    UsersConnectionsStatisticModule.forRoot({
      dataSourceName: 'boar_pack_db'
    }),
    ProviderMonitoringModule.forRootAsync({
      dataSourceName: 'boar_pack_db',
    }),
    InstrumentsHistoryModule.forRoot({
      dataSourceName: 'boar_pack_db',
    }),
    ApiStatisticModule.forRoot({
      dataSourceName: 'boar_pack_db',
    })
  ],
})
class Swagger {
}

async function bootstrap() {
  try {
    const app = await NestFactory.create(Swagger);

    const options: SwaggerDocumentOptions = {
      operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    };

    const swaggerConfig = new DocumentBuilder()
      .setTitle('API')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig, options);

    SwaggerModule.setup('docs', app, document);
    await app.listen(3335);
    await generate({
      input: 'http://localhost:3335/docs-json',
      output: resolve(__dirname, '../../../liquidity-monitor-frontend/src/tools/api-client/generated'),
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
