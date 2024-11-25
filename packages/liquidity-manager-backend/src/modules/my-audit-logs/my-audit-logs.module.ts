import { Module } from "@nestjs/common";
import { MyAuditLogsController } from "./my-audit-logs.controller";
import { EventLogsModule } from "@jifeon/boar-pack-users-backend";

@Module({})
export class MyAuditLogsModule {
  static forManagerPanel({
    dataSourceName,
  }: {
    dataSourceName: string;
  }) {
    return {
      module: MyAuditLogsModule,
      imports: [
        EventLogsModule.forFeature({
          dataSourceName,
        }),
      ],
      controllers: [
        MyAuditLogsController,
      ],
      providers: [],
      exports: [],
    };
  }
}
