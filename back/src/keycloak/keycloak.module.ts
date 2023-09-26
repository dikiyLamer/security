import { Module } from '@nestjs/common';
import { KeycloakConnectModule } from 'nest-keycloak-connect';
import { KeycloakConfigModule } from './keycloak-config.module';
import { KeycloakConfigService } from './keycloak-config.service';

@Module({
  imports: [
    KeycloakConnectModule.registerAsync({
      useExisting: KeycloakConfigService,
      imports: [KeycloakConfigModule],
    }),
  ],
  exports: [KeycloakConnectModule],
})
export class KeycloakModule {

}
