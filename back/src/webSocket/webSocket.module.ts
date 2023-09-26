import { Module } from "@nestjs/common";
import { WSGateway } from "./webSocketGateway.service";

@Module({
    providers: [WSGateway]
  })
  export class WSModule {}