import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TokenStore } from 'src/helpers/token.store';

@Injectable()
export class TokenInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {


    const tokenStore: TokenStore = new TokenStore()

    tokenStore.setToken(context.getArgs()[0].accessTokenJWT)

    return next
      .handle()
  }
}