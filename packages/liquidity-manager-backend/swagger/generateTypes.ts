import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule, } from '@nestjs/swagger';
import { Module } from "@nestjs/common";
import { LiquidityManagersModule, restModules } from "../src";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AMTS_DB_NAME } from "../src/liquidity-app.config";
import { resolve } from "path";
import { ConfigModule } from "@nestjs/config";
import { generate } from "openapi-typescript-codegen";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve(__dirname, '.env'),
    }),
    TypeOrmModule.forRoot({
      name: AMTS_DB_NAME,
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'app',
      password: 'password',
      database: 'datacollector_d',
      entities: [
        resolve(__dirname, '../src/**/entities/*.entity.{ts,js}')
      ],
    }),
    LiquidityManagersModule.register({ dataSourceName: AMTS_DB_NAME }),
    ...restModules,
  ],
})
class Swagger {
}

async function bootstrap() {
  try {
    const app = await NestFactory.create(Swagger);
    const options: SwaggerDocumentOptions = {
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        methodKey,
    };

    const swaggerConfig = new DocumentBuilder()
      .setTitle('API')
      .setVersion('1.0')
      .build();

    // @ts-ignore
    const document = SwaggerModule.createDocument(app, swaggerConfig, options);
    // @ts-ignore
    SwaggerModule.setup('docs', app, document);
    await app.listen(3335);
    await generate({
      input: 'http://localhost:3335/docs-json',
      output: resolve(__dirname, '../api-client'),
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