
import { Global, Module, OnApplicationShutdown, Scope } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { Redis } from 'ioredis';

import { RedisService } from './redis.service';


const IORedisKey = 'IORedis';

@Module({
  providers: [
    {
      provide: IORedisKey,
      useFactory: async () => {
        return new Redis(6379, '10.11.2.146', {username:'default', password: 'password'});
      },
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(private readonly moduleRef: ModuleRef) {}

  async onApplicationShutdown(signal?: string): Promise<void> {
    return new Promise<void>((resolve) => {
      const redis = this.moduleRef.get(IORedisKey);
      redis.quit();
      redis.on('end', () => {
        resolve();
      });
    });
  }
}