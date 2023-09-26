import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

import { keycloak_role } from "./schemas/keycloak/keycloak_role.schema";
import { HttpModule } from "@nestjs/axios";
import { TypeOrmModule } from "@nestjs/typeorm";
import { user_role_mapping } from "./schemas/keycloak/user_role_mapping.schema";
import { user_entity } from "./schemas/keycloak/user_entity.schema";
import { Microservice } from "./schemas/microservice.schema";
import { Resource } from "./schemas/resource.schema";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { WSGateway } from "src/webSocket/webSocketGateway.service";
import { UserRule } from "./schemas/user_rule.schema";
import { ResourceRule } from "./schemas/resource_rule.schema";

import { Rule } from "./schemas/rule.schema";
import { ConfigModule } from "@nestjs/config";
import { user_group_membership } from "./schemas/keycloak/user_group_membership";
import { group_attribute } from "./schemas/keycloak/group_attribute.schema";
import { KeycloakModule } from "src/keycloak/keycloak.module";
import { RedisModule } from "src/redis/redis.module";
import { ResourceAttribute } from "./schemas/resource-attribute.schema";
import { Field } from "./schemas/field.schema";



@Module({
  imports: [TypeOrmModule.forFeature([keycloak_role, user_role_mapping, user_entity, Microservice, Resource, UserRule, ResourceRule, Rule, user_group_membership, group_attribute, ResourceAttribute, Field]),
    HttpModule,
  ConfigModule.forRoot({
    envFilePath: '.development.env'
  }),
    KeycloakModule,
    RedisModule,
  ClientsModule.register([
    {
      name: 'BT_SERVICE',
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_ADDRESS],// ['amqp://rmuser:rmpassword@10.11.10.10:5672'], //
        queue: 'bt_auth_queue1',
        queueOptions: {
          durable: false
        },

      },
    },
  ]),],
  controllers: [AuthController],
  providers: [AuthService, WSGateway]
})
export class AuthModule {

}