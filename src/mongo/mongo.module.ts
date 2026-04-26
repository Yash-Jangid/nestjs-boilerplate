import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { ApiKeyGuard } from '../utils/guards/api-key.guard';
import { MongoProxyController } from './mongo-proxy.controller';
import { MongoProxyService } from './mongo-proxy.service';

@Module({
  imports: [
    ConfigModule,
    // MongooseModule with no forFeature — we use InjectConnection for dynamic collections
    MongooseModule,
  ],
  controllers: [MongoProxyController],
  providers: [MongoProxyService, ApiKeyGuard],
})
export class MongoModule {}
