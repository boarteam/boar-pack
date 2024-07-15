import { Module } from "@nestjs/common";
import { WebsocketsClients } from "./websockets.clients";

@Module({
  providers: [
    WebsocketsClients,
  ],
  exports: [
    WebsocketsClients,
  ],
})
export class WebsocketsModule {
}
