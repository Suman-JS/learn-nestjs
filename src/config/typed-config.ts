import { EnvVariables } from '@/env';
import { Injectable, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TypedConfigService {
  constructor(private readonly configService: ConfigService) {}

  get<K extends keyof EnvVariables>(key: K): EnvVariables[K] {
    return this.configService.get(key) as EnvVariables[K];
  }
}

@Module({
  providers: [TypedConfigService],
  exports: [TypedConfigService],
})
export class ConfigWrapperModule {}
