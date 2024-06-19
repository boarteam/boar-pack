import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule, } from '@nestjs/swagger';
import { Module } from "@nestjs/common";
import { AuthModule as LMAuthModule, LiquidityManagersModule, restModules } from "./index";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AMTS_DB_NAME } from "./modules/liquidity-app/liquidity-app.config";
import { resolve } from "path";
import { ConfigModule } from "@nestjs/config";
// @ts-ignore-next-line - Ignore the error because the package on project level
import { generate } from "openapi-typescript-codegen";
import { QuoteDto, QuoteEventDto, SubscribeEventDto } from "./modules/quotes/dto/quotes.dto";
import { WebsocketsErrorEventDto } from "@jifeon/boar-pack-common-backend";

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
      entities: [
        resolve(__dirname, '../src/**/entities/*.entity.{ts,js}')
      ],
    }),
    LiquidityManagersModule.register({ dataSourceName: AMTS_DB_NAME }),
    LMAuthModule,
    ...restModules,
  ],
})
class Swagger {
}

async function bootstrap() {
  try {
    const app = await NestFactory.create(Swagger);
    const options: SwaggerDocumentOptions = {
      operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
      extraModels: [
        WebsocketsErrorEventDto,
        QuoteDto,
        QuoteEventDto,
        SubscribeEventDto,
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
