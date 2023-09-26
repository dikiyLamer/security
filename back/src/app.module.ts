import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { keycloak_role } from './auth/schemas/keycloak/keycloak_role.schema';
import { user_role_mapping } from './auth/schemas/keycloak/user_role_mapping.schema';
import { user_entity } from './auth/schemas/keycloak/user_entity.schema';
import { Microservice } from './auth/schemas/microservice.schema';
import { Resource } from './auth/schemas/resource.schema';
import { WSGateway } from './webSocket/webSocketGateway.service';
import { ResourceRule } from './auth/schemas/resource_rule.schema';
import { UserRule } from './auth/schemas/user_rule.schema';
import { Rule } from './auth/schemas/rule.schema';
import { user_group_membership } from './auth/schemas/keycloak/user_group_membership';
import { group_attribute } from './auth/schemas/keycloak/group_attribute.schema';
import { KeycloakModule } from './keycloak/keycloak.module';
import { ResourceAttribute } from './auth/schemas/resource-attribute.schema';
import { Field } from './auth/schemas/field.schema';


@Module({
  imports: [AuthModule,
            ConfigModule.forRoot({
              envFilePath:'.development.env'
            }),
            KeycloakModule,
            TypeOrmModule.forRoot(
              {
                type: 'postgres',
                host: process.env.POSTGRESQL_HOST,
                port: parseInt(process.env.POSTGRESQL_PORT),
                username: process.env.POSTGRESQL_USER,
                password: process.env.POSTGRESQL_PASS,
                database: process.env.POSTGRESQL_DB,
                entities: [keycloak_role,user_role_mapping,user_entity, Microservice, Resource, UserRule, ResourceRule, Rule, user_group_membership, group_attribute, ResourceAttribute,Field],
                synchronize: true,
                // dropSchema: true
              }
            ),


            ],
  controllers: [AppController],
  providers: [AppService, WSGateway],
})
export class AppModule {}
