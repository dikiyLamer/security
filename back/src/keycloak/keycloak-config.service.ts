import { Injectable } from '@nestjs/common';
import { KeycloakConnectOptions, KeycloakConnectOptionsFactory, PolicyEnforcementMode, TokenValidation } from 'nest-keycloak-connect';

@Injectable()
export class KeycloakConfigService implements KeycloakConnectOptionsFactory {

  createKeycloakConnectOptions(): KeycloakConnectOptions {
return {
  authServerUrl: process.env.KEYCLOAK_AUTH_SRVER_URL,
  realm: process.env.KEYCLOAK_REALM,
  clientId: process.env.KEYCLOAK_CLIENT_ID,
  secret: process.env.KEYCLOAK_SECRET,
  cookieKey: 'KEYCLOAK_IDENTITY',
  logLevels: ['verbose'],
  "confidential-port": 0,
  useNestLogger: true,
  policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
  tokenValidation: TokenValidation.OFFLINE,
  verifyTokenAudience: true,
  "ssl-required": "external",
  realmPublicKey: process.env.KEYCLOAK_REALM_PUBLIC_KEY};

}
}